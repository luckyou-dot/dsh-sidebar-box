/**
 * 收纳盒 (Sidebar box) — client half.
 *
 * Registers:
 *   - `sidebar.panellist` / `main` key `sidebar-box`: the entry and management page.
 *
 * Collected entries are shown only in the management page's preview rail; the
 * plugin deliberately does not register `sidebar.panellist.actions`, so nothing
 * custom is added to the sidebar's More menu.
 *
 * The sidebar rows of managed entries are enhanced reversibly: the original
 * aria-label/text and display value are remembered in data attributes, and the
 * observer only removes attributes/styles it added itself.
 */
window.__ModuleLoader__.load({
  id: '@local/dsh-sidebar-box',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const NS = 'sidebarBox'
    const PANEL_ID = 'sidebar-box'
    const STORAGE_KEY = 'dsh-sidebar-box:prefs:v1'

    const MANAGED = [
      { id: 'dsh-market', source: 'dshmarket', zh: '插件市场', en: 'Plugin market', glyph: 'market' },
      { id: 'ws-recency-search', source: 'dsh-ws-recency', zh: '搜索会话内容', en: 'Search session content', glyph: 'search' },
      { id: 'ws-recency-trash', source: 'dsh-ws-recency', zh: '回收站', en: 'Trash', glyph: 'trash' },
      { id: 'ssh', source: '@linxin666/dsh-ssh', zh: 'SSH', en: 'SSH', glyph: 'terminal' },
    ]
    const MANAGED_BY_ID = new Map(MANAGED.map(item => [item.id, item]))
    const DEFAULT_ORDER = MANAGED.map(item => item.id)

    const EN = {
      'entry.label': 'Sidebar box',
      'page.title': 'Sidebar box',
      'page.subtitle': 'Collect sidebar entries you rarely use. Changes are saved in this browser.',
      'page.kicker': 'CONTROL PANEL',
      'page.system': 'Plugins',
      'page.badge': '{count} entries',
      'page.desc': 'Keep the sidebar for what you use today. Everything else goes into the box.',
      'section.entries': 'Entry index',
      'section.entriesDesc': 'Collect what you rarely use, then drag or use the arrows to set the order inside the box.',
      'preview.kicker': 'BOX PREVIEW',
      'preview.title': 'Collected',
      'preview.empty': 'Nothing in the box yet',
      'preview.emptyHint': 'Collected entries appear here.',
      'summary.managed': 'Managed',
      'summary.collected': 'Collected',
      'summary.shown': 'Shown in sidebar',
      'toolbar.search': 'Search entries',
      'toolbar.selectAll': 'Select all',
      'toolbar.collect': 'Collect',
      'toolbar.show': 'Show',
      'toolbar.reset': 'Reset',
      'toolbar.selected': '{count} selected',
      'toolbar.clearSelection': 'Clear selection',
      'toolbar.resetConfirm': 'Reset all Sidebar box settings? This cannot be undone.',
      'row.select': 'Select {name}',
      'row.visible': 'Shown',
      'row.collected': 'Collected',
      'row.favorite': 'Keep in sidebar',
      'row.favoriteOn': 'Kept in sidebar',
      'row.favoriteHint': 'Kept in sidebar even while collected',
      'row.open': 'Open {name}',
      'row.rename': 'Rename {name}',
      'row.drag': 'Drag {name} to reorder',
      'row.moveUp': 'Move {name} up',
      'row.moveDown': 'Move {name} down',
      'row.unavailable': 'Not installed',
      'row.source': 'From {source}',
      'row.state': 'Display state',
      'menu.title': 'Sidebar box',
      'menu.search': 'Search collected entries',
      'menu.empty': 'Nothing collected yet',
      'menu.emptyHint': 'Open Sidebar box to collect entries.',
      'menu.noMatch': 'No matching entries',
      'menu.manage': 'Manage Sidebar box',
      'menu.collapse': 'Collapse Sidebar box',
      'menu.expand': 'Expand Sidebar box',
    }

    const ZH = {
      'entry.label': '收纳盒',
      'page.title': '收纳盒',
      'page.subtitle': '把不常用的左侧栏入口收进来。所有设置只保存在当前浏览器。',
      'page.kicker': '控制面板',
      'page.system': '插件',
      'page.badge': '{count} 个入口',
      'page.desc': '把不常用的左侧栏入口收进来，让侧栏只留下今天真正要用的东西。',
      'section.entries': '入口清单',
      'section.entriesDesc': '收好不常用的入口，再用拖拽或上下按钮调整它们在收纳盒里的顺序。',
      'preview.kicker': '收纳盒预览',
      'preview.title': '已收纳',
      'preview.empty': '还没有收纳入口',
      'preview.emptyHint': '收纳后的入口会显示在这里。',
      'summary.managed': '管理入口',
      'summary.collected': '已收纳',
      'summary.shown': '侧栏显示',
      'toolbar.search': '搜索入口',
      'toolbar.selectAll': '全选',
      'toolbar.collect': '收纳',
      'toolbar.show': '显示',
      'toolbar.reset': '重置',
      'toolbar.selected': '已选 {count} 项',
      'toolbar.clearSelection': '取消选择',
      'toolbar.resetConfirm': '重置收纳盒的全部设置？此操作无法撤销。',
      'row.select': '选择 {name}',
      'row.visible': '显示',
      'row.collected': '收纳',
      'row.favorite': '常用置顶',
      'row.favoriteOn': '已常用置顶',
      'row.favoriteHint': '设为常用后，即使收纳也仍显示在侧栏',
      'row.open': '打开 {name}',
      'row.rename': '重命名 {name}',
      'row.drag': '拖拽 {name} 调整顺序',
      'row.moveUp': '上移 {name}',
      'row.moveDown': '下移 {name}',
      'row.unavailable': '未安装',
      'row.source': '来自 {source}',
      'row.state': '显示状态',
      'menu.title': '收纳盒',
      'menu.search': '搜索已收纳的入口',
      'menu.empty': '还没有收纳入口',
      'menu.emptyHint': '打开「收纳盒」管理页把入口收进来。',
      'menu.noMatch': '没有匹配的入口',
      'menu.manage': '管理收纳盒',
      'menu.collapse': '折叠收纳盒',
      'menu.expand': '展开收纳盒',
    }

    const CSS = `
[data-dsh-sb-hidden]{display:none!important}
.dsh-sb-page,.dsh-sb-menu{
  --sb-font-display:'Inter','Noto Sans SC','PingFang SC','Hiragino Sans GB','Microsoft YaHei',system-ui,sans-serif;
  --sb-font-sans:'Inter','Noto Sans SC','PingFang SC','Hiragino Sans GB','Microsoft YaHei',system-ui,sans-serif;
  --sb-font-mono:'JetBrains Mono','IBM Plex Mono','SFMono-Regular',Consolas,monospace;
  --sb-paper:#fafaf8;
  --sb-paper-2:#f0f0ee;
  --sb-ink:#0a0a0a;
  --sb-ink-2:#525252;
  --sb-muted:#737373;
  --sb-line:#d4d4d2;
  --sb-line-strong:#a3a3a3;
  --sb-accent:#002fa7;
  --sb-accent-bright:#5b7bff;
  --sb-accent-soft:#d5deef;
  --sb-accent-on:#ffffff;
  --sb-dark-panel:#0a0a0a;
  --sb-dark-ink:#fafaf8;
  color-scheme:light;
}
[data-ds-dark-theme] .dsh-sb-page,[data-ds-dark-theme] .dsh-sb-menu{
  --sb-paper:#101010;
  --sb-paper-2:#181818;
  --sb-ink:#f2efe8;
  --sb-ink-2:#c9c4b9;
  --sb-muted:#8a8a8a;
  --sb-line:#2c2c2c;
  --sb-line-strong:#565656;
  --sb-accent:#5b7bff;
  --sb-accent-bright:#8fa6ff;
  --sb-accent-soft:#1c2740;
  --sb-accent-on:#0a0a0a;
  --sb-dark-panel:#1a1a1a;
  --sb-dark-ink:#fafaf8;
  color-scheme:dark;
}
.dsh-sb-page{box-sizing:border-box;min-height:100%;padding:calc(var(--dsh-frame-top-clearance,48px) + 30px) 40px 56px;background:var(--sb-paper);color:var(--sb-ink);font-family:var(--sb-font-sans);font-size:14px;line-height:1.5;-webkit-font-smoothing:antialiased}
.dsh-sb-page *{box-sizing:border-box}
.dsh-sb-page button,.dsh-sb-page input,.dsh-sb-page select,.dsh-sb-menu button,.dsh-sb-menu input,.dsh-sb-menu select{font:inherit}
.dsh-sb-page button{cursor:pointer}
.dsh-sb-page button:disabled{cursor:not-allowed;opacity:.35}
.dsh-sb-inner{width:100%;max-width:1180px;margin:0 auto}
.dsh-sb-chrome{display:flex;justify-content:space-between;gap:16px;padding:0 0 10px;border-bottom:1px solid var(--sb-line);color:var(--sb-muted);font:9px/1.4 var(--sb-font-mono);letter-spacing:.15em;text-transform:uppercase}
.dsh-sb-chrome span:nth-child(2){color:var(--sb-ink-2)}
.dsh-sb-hero{display:grid;grid-template-columns:110px minmax(0,1fr) 180px;gap:24px;align-items:start;padding:34px 0 30px;border-bottom:2px solid var(--sb-ink)}
.dsh-sb-hero-index{font:200 96px/.8 var(--sb-font-display);letter-spacing:-.07em;color:var(--sb-line);user-select:none}
.dsh-sb-kicker{font:9px var(--sb-font-mono);letter-spacing:.18em;text-transform:uppercase;color:var(--sb-accent);margin-bottom:15px}
.dsh-sb-title{margin:0;font:300 clamp(40px,5vw,68px)/1 var(--sb-font-display);letter-spacing:-.04em;color:var(--sb-ink)}
.dsh-sb-subtitle{margin:14px 0 0;max-width:42em;color:var(--sb-ink-2);font-size:15px;line-height:1.75}
.dsh-sb-hero-mark{justify-self:end;display:flex;flex-direction:column;align-items:flex-end;gap:12px;text-align:right}
.dsh-sb-logo{display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;background:var(--sb-accent);color:var(--sb-accent-on)}
.dsh-sb-control{font:9px/1.5 var(--sb-font-mono);letter-spacing:.14em;text-transform:uppercase;color:var(--sb-muted)}
.dsh-sb-stats{display:grid;grid-template-columns:repeat(3,1fr);border-bottom:1px solid var(--sb-line)}
.dsh-sb-stat{display:flex;flex-direction:column;gap:8px;padding:22px 24px 20px;border-right:1px solid var(--sb-line)}
.dsh-sb-stat:last-child{border-right:0}
.dsh-sb-stat.is-soft{background:var(--sb-paper-2)}
.dsh-sb-stat.is-accent{background:var(--sb-accent);color:var(--sb-accent-on);border-right:0}
.dsh-sb-stat-number{font:200 52px/.85 var(--sb-font-display);letter-spacing:-.05em;font-variant-numeric:tabular-nums}
.dsh-sb-stat-label{font:500 12px var(--sb-font-sans)}
.dsh-sb-stat-note{font:8px var(--sb-font-mono);letter-spacing:.16em;text-transform:uppercase;opacity:.58}
.dsh-sb-workspace{display:grid;grid-template-columns:minmax(0,1fr) 318px;gap:42px;align-items:start;padding-top:34px}
.dsh-sb-main{min-width:0;display:flex;flex-direction:column;gap:38px}
.dsh-sb-section-head{display:grid;grid-template-columns:72px minmax(0,1fr);gap:18px;padding-top:18px;border-top:2px solid var(--sb-ink);margin-bottom:18px}
.dsh-sb-section-num{font:200 56px/.8 var(--sb-font-display);letter-spacing:-.05em;color:var(--sb-line);padding-top:2px}
.dsh-sb-section-title h2{margin:0;font:300 27px/1.25 var(--sb-font-display);letter-spacing:-.02em}
.dsh-sb-section-title p{margin:8px 0 0;max-width:40em;color:var(--sb-muted);font-size:12.5px;line-height:1.6}
.dsh-sb-toolbar{display:flex;flex-wrap:wrap;align-items:stretch;gap:8px;margin-bottom:8px}
.dsh-sb-search{position:relative;flex:1 1 240px;min-width:180px}
.dsh-sb-search svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--sb-muted);pointer-events:none}
.dsh-sb-search input{width:100%;height:42px;padding:0 12px 0 36px;border:0;border-bottom:2px solid var(--sb-ink);border-radius:0;background:var(--sb-paper-2);color:var(--sb-ink);font-size:13px;outline:none}
.dsh-sb-search input:focus{border-bottom-color:var(--sb-accent);background:var(--sb-paper)}
.dsh-sb-actions{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.dsh-sb-btn{display:inline-flex;align-items:center;justify-content:center;gap:5px;height:34px;padding:0 12px;border:0;border-radius:0;background:var(--sb-paper-2);color:var(--sb-ink);font:10px/1 var(--sb-font-mono);letter-spacing:.05em;text-transform:uppercase;white-space:nowrap}
.dsh-sb-btn:hover:not(:disabled){background:var(--sb-line)}
.dsh-sb-btn.is-primary{background:var(--sb-accent);color:var(--sb-accent-on)}
.dsh-sb-btn.is-primary:hover:not(:disabled){background:var(--sb-accent);filter:brightness(.92)}
.dsh-sb-btn.is-danger{background:transparent;color:#b33a3a;text-decoration:underline;text-underline-offset:3px}
.dsh-sb-btn.is-danger:hover:not(:disabled){background:transparent;color:#8e2525}
.dsh-sb-btn:focus-visible,.dsh-sb-iconbtn:focus-visible,.dsh-sb-star:focus-visible,.dsh-sb-seg-btn:focus-visible,.dsh-sb-link:focus-visible,.dsh-sb-menu :focus-visible{outline:2px solid var(--sb-accent);outline-offset:2px}
.dsh-sb-selection{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:8px 0 10px;color:var(--sb-muted);font:9px var(--sb-font-mono);letter-spacing:.06em;text-transform:uppercase}
.dsh-sb-link{padding:0;border:0;background:transparent;color:var(--sb-accent);font:inherit;text-decoration:underline;text-underline-offset:3px}
.dsh-sb-list{display:flex;flex-direction:column;border-top:1px solid var(--sb-line)}
.dsh-sb-row{display:grid;grid-template-columns:26px 18px 44px minmax(0,1fr) auto;align-items:center;gap:14px;min-height:84px;padding:14px 14px 14px 12px;background:var(--sb-paper);border-bottom:1px solid var(--sb-line);transition:background .15s ease,box-shadow .15s ease}
.dsh-sb-row:hover{background:var(--sb-paper-2)}
.dsh-sb-row.is-dragover{box-shadow:inset 3px 0 0 var(--sb-accent);background:var(--sb-accent-soft)}
.dsh-sb-row-meta{display:flex;flex-direction:column;align-items:center;gap:8px;color:var(--sb-muted);font:9px var(--sb-font-mono);letter-spacing:.04em}
.dsh-sb-check{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px}
.dsh-sb-check input{width:15px;height:15px;accent-color:var(--sb-accent);cursor:pointer}
.dsh-sb-drag{display:inline-flex;align-items:center;justify-content:center;width:18px;height:28px;color:var(--sb-line-strong);cursor:grab;font-size:16px;letter-spacing:-3px;user-select:none}
.dsh-sb-drag:active{cursor:grabbing}
.dsh-sb-ico{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;background:var(--sb-paper-2);color:var(--sb-accent);transition:background .15s ease,color .15s ease}
.dsh-sb-row:hover .dsh-sb-ico{background:var(--sb-accent-soft);color:var(--sb-accent)}
.dsh-sb-main{min-width:0}
.dsh-sb-line1{display:flex;align-items:center;gap:8px;min-width:0}
.dsh-sb-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:16px;font-weight:500;letter-spacing:-.01em}
.dsh-sb-badge{flex:none;display:inline-flex;align-items:center;height:18px;padding:0 6px;background:var(--sb-accent-soft);color:var(--sb-accent);font:9px var(--sb-font-mono);letter-spacing:.06em;text-transform:uppercase}
.dsh-sb-badge.is-muted{background:transparent;color:var(--sb-muted)}
.dsh-sb-line2{display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin-top:5px;color:var(--sb-muted);font-size:11px}
.dsh-sb-source{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:240px;font:9px var(--sb-font-mono);letter-spacing:.06em;text-transform:uppercase}
.dsh-sb-controls{display:flex;align-items:center;gap:10px;justify-content:flex-end}
.dsh-sb-star,.dsh-sb-iconbtn{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;padding:0;border:0;border-radius:0;background:transparent;color:var(--sb-muted);font-size:14px}
.dsh-sb-star:hover,.dsh-sb-iconbtn:hover{background:var(--sb-paper-2);color:var(--sb-ink)}
.dsh-sb-star.is-on{color:var(--sb-accent)}
.dsh-sb-star.is-on:hover{color:var(--sb-accent)}
.dsh-sb-seg{display:inline-flex;align-items:center;border:1px solid var(--sb-ink);background:transparent}
.dsh-sb-seg-btn{height:28px;padding:0 10px;border:0;background:transparent;color:var(--sb-ink-2);font:9px var(--sb-font-mono);letter-spacing:.04em;text-transform:uppercase}
.dsh-sb-seg-btn.is-on{background:var(--sb-ink);color:var(--sb-paper)}
.dsh-sb-move{display:inline-flex;flex-direction:column;gap:2px}
.dsh-sb-move button{display:inline-flex;align-items:center;justify-content:center;width:20px;height:16px;padding:0;border:0;border-radius:0;background:transparent;color:var(--sb-muted);font-size:9px;line-height:1}
.dsh-sb-move button:hover:not(:disabled){background:var(--sb-paper-2);color:var(--sb-ink)}
.dsh-sb-empty{padding:26px 14px;text-align:center;color:var(--sb-muted);border-bottom:1px solid var(--sb-line)}
.dsh-sb-empty strong{display:block;color:var(--sb-ink);font-size:15px;margin-bottom:5px;font-weight:500}
.dsh-sb-empty span{font-size:12px}
.dsh-sb-input{height:40px;padding:0 12px;border:0;border-bottom:2px solid var(--sb-ink);border-radius:0;background:var(--sb-paper-2);color:var(--sb-ink);font-size:12px;outline:none}
.dsh-sb-input:focus{border-bottom-color:var(--sb-accent);background:var(--sb-paper)}
.dsh-sb-rail{position:sticky;top:calc(var(--dsh-frame-top-clearance,48px) + 24px);display:flex;flex-direction:column;gap:16px}
.dsh-sb-preview{background:var(--sb-dark-panel);color:var(--sb-dark-ink);padding:22px 20px 16px}
.dsh-sb-preview-kicker{font:9px var(--sb-font-mono);letter-spacing:.17em;text-transform:uppercase;color:var(--sb-accent-bright);margin-bottom:18px}
.dsh-sb-preview-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;border-bottom:1px solid rgba(255,255,255,.22);padding-bottom:12px}
.dsh-sb-preview-title{font:300 24px/1.1 var(--sb-font-display);letter-spacing:-.02em}
.dsh-sb-preview-count{font:200 34px/.9 var(--sb-font-display);letter-spacing:-.04em;color:var(--sb-accent-bright);font-variant-numeric:tabular-nums}
.dsh-sb-preview-row{display:grid;grid-template-columns:26px minmax(0,1fr);gap:8px;align-items:center;width:100%;padding:10px 0;border:0;border-bottom:1px solid rgba(255,255,255,.12);background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
.dsh-sb-preview-row:hover .dsh-sb-preview-name{color:var(--sb-accent-bright)}
.dsh-sb-preview-row:disabled{cursor:not-allowed;opacity:.45}
.dsh-sb-preview-index{font:9px var(--sb-font-mono);color:rgba(255,255,255,.45);letter-spacing:.05em}
.dsh-sb-preview-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;transition:color .12s ease}
.dsh-sb-preview-empty{padding:18px 0 14px;border-bottom:1px solid rgba(255,255,255,.12)}
.dsh-sb-preview-empty strong{display:block;font-size:13px;font-weight:500;margin-bottom:4px}
.dsh-sb-preview-empty span{font-size:11px;color:rgba(255,255,255,.55);line-height:1.5}
.dsh-sb-mini{background:var(--sb-paper-2);padding:18px 20px}
.dsh-sb-mini-title{font:9px var(--sb-font-mono);letter-spacing:.16em;text-transform:uppercase;color:var(--sb-muted);padding-bottom:10px;border-bottom:1px solid var(--sb-line)}
.dsh-sb-mini-row{display:flex;justify-content:space-between;gap:8px;align-items:baseline;padding:9px 0;border-bottom:1px solid var(--sb-line);font-size:12px}
.dsh-sb-mini-row:last-child{border-bottom:0}
.dsh-sb-mini-count{font:9px var(--sb-font-mono);color:var(--sb-muted);letter-spacing:.04em}
.dsh-sb-mini-empty{padding:14px 0 2px;color:var(--sb-muted);font-size:12px}
.dsh-sb-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.dsh-sb-menu{display:flex;flex-direction:column;gap:2px;min-width:0;width:100%;padding:6px 6px 8px;background:var(--sb-paper);color:var(--sb-ink);font-family:var(--sb-font-sans)}
.dsh-sb-menu-head{display:flex;align-items:center;gap:8px;width:100%;height:34px;padding:0 9px;border:0;border-radius:0;background:var(--sb-accent);color:var(--sb-accent-on);font:9px/1 var(--sb-font-mono);letter-spacing:.1em;text-transform:uppercase;text-align:left}
.dsh-sb-menu-head:hover{background:var(--sb-accent);filter:brightness(1.08)}
.dsh-sb-menu-head .dsh-sb-menu-caret{margin-left:auto;color:inherit;font-size:10px;transition:transform .12s ease}
.dsh-sb-menu-head[aria-expanded="false"] .dsh-sb-menu-caret{transform:rotate(-90deg)}
.dsh-sb-menu-head .dsh-sb-menu-count{background:rgba(255,255,255,.18);color:inherit}
.dsh-sb-menu-count{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;border-radius:0;background:var(--sb-accent-soft);color:var(--sb-accent);font:9px var(--sb-font-mono);font-weight:500}
.dsh-sb-menu-search{padding:4px 2px 5px}
.dsh-sb-menu-search input{width:100%;height:32px;padding:0 8px;border:0;border-bottom:2px solid var(--sb-ink);border-radius:0;background:var(--sb-paper-2);color:var(--sb-ink);font-size:11px;outline:none}
.dsh-sb-menu-search input:focus{border-bottom-color:var(--sb-accent);background:var(--sb-paper)}
.dsh-sb-menu-row{display:flex;align-items:center;gap:8px;width:100%;min-height:34px;padding:4px 8px;border:0;border-radius:0;background:transparent;color:var(--sb-ink);font-size:12px;text-align:left}
.dsh-sb-menu-row:hover:not(:disabled){background:var(--sb-paper-2)}
.dsh-sb-menu-row:disabled{opacity:.45}
.dsh-sb-menu-row .dsh-sb-menu-ico{flex:none;display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;color:var(--sb-muted)}
.dsh-sb-menu-row .dsh-sb-menu-label{min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-sb-menu-row .dsh-sb-menu-check{flex:none;color:var(--sb-accent);font-size:11px}
.dsh-sb-menu-row .dsh-sb-menu-star{flex:none;color:var(--sb-accent);font-size:10px}
.dsh-sb-menu-empty{padding:10px 9px;color:var(--sb-muted);font-size:11px;line-height:1.5}
.dsh-sb-menu-divider{height:1px;margin:5px 4px;background:var(--sb-line)}
.dsh-sb-menu-manage{margin-top:2px;background:var(--sb-accent-soft);color:var(--sb-accent);text-transform:uppercase;letter-spacing:.03em}
.dsh-sb-menu-manage:hover{background:var(--sb-accent);color:var(--sb-accent-on)}
.dsh-sb-menu-manage .dsh-sb-menu-ico{color:inherit}
@media (max-width:1024px){
 .dsh-sb-workspace{grid-template-columns:1fr}
 .dsh-sb-rail{position:static;display:grid;grid-template-columns:1fr 1fr;gap:16px}
}
@media (max-width:760px){
 .dsh-sb-page{padding:calc(var(--dsh-frame-top-clearance,48px) + 16px) 16px 40px}
 .dsh-sb-chrome span:nth-child(2){display:none}
 .dsh-sb-hero{grid-template-columns:56px minmax(0,1fr);gap:14px;padding:24px 0 22px}
 .dsh-sb-hero-index{font-size:64px}
 .dsh-sb-hero-mark{grid-column:2;justify-self:start;flex-direction:row;align-items:center;text-align:left}
 .dsh-sb-logo{width:40px;height:40px}
 .dsh-sb-stats{grid-template-columns:1fr}
 .dsh-sb-stat{border-right:0;border-bottom:1px solid var(--sb-line)}
 .dsh-sb-stat:last-child{border-bottom:0}
 .dsh-sb-row{grid-template-columns:24px 18px 40px minmax(0,1fr);gap:10px;padding:14px 10px}
 .dsh-sb-controls{grid-column:2/-1;justify-content:flex-start;flex-wrap:wrap;padding-left:42px}
 .dsh-sb-section-head{grid-template-columns:48px minmax(0,1fr);gap:12px}
 .dsh-sb-section-num{font-size:42px}
 .dsh-sb-rail{grid-template-columns:1fr}
}

  /* ==== B · 极简工作台 ==== */
  .dsh-sb-page,.dsh-sb-menu{
    --sb-bg:#f5f7fb;
    --sb-surface:#ffffff;
    --sb-surface-2:#f3f5f9;
    --sb-hover:#f7f9fd;
    --sb-row-line:#eef1f7;
    --sb-icon-bg:#f0f3fb;
    --sb-icon-ink:#6877dc;
    --sb-chip-bg:#f3f5f9;
    --sb-chip-ink:#8c99aa;
    --sb-preview-line:#edf0f5;
    --sb-preview-text:#344054;
    --sb-preview-muted:#a0abba;
    --sb-seg-on:#ffffff;
    --sb-ink:#172033;
    --sb-ink-2:#526174;
    --sb-muted:#8995a5;
    --sb-line:#e4e9f2;
    --sb-line-strong:#cdd6e4;
    --sb-accent:#4d5dfb;
    --sb-accent-bright:#7682ff;
    --sb-accent-soft:#eef0ff;
    --sb-accent-on:#ffffff;
    --sb-mint:#0f9d91;
    --sb-mint-soft:#e6f6f3;
    --sb-amber:#f0a23a;
    --sb-preview-top:#172033;
    color-scheme:light;
  }
  [data-ds-dark-theme] .dsh-sb-page,[data-ds-dark-theme] .dsh-sb-menu{
    --sb-bg:#0d1117;
    --sb-surface:#151b24;
    --sb-surface-2:#1b2330;
    --sb-hover:#1a2330;
    --sb-row-line:#263141;
    --sb-icon-bg:#202b3a;
    --sb-icon-ink:#9aabff;
    --sb-chip-bg:#202a39;
    --sb-chip-ink:#a7b4c4;
    --sb-preview-line:#2a3545;
    --sb-preview-text:#dbe3ef;
    --sb-preview-muted:#8b98ab;
    --sb-seg-on:#2a3545;
    --sb-ink:#e7edf6;
    --sb-ink-2:#cbd5e1;
    --sb-muted:#8b98ab;
    --sb-line:#283343;
    --sb-line-strong:#415065;
    --sb-accent:#8ea2ff;
    --sb-accent-bright:#b0bdff;
    --sb-accent-soft:#1f2a4a;
    --sb-accent-on:#10131a;
    --sb-mint:#5ed6c3;
    --sb-mint-soft:#173e3a;
    --sb-amber:#f4b45f;
    --sb-preview-top:#111a26;
    color-scheme:dark;
  }
  .dsh-sb-page{
    box-sizing:border-box;
    height:100%;
    min-height:0;
    padding:calc(var(--dsh-frame-top-clearance,48px) + 30px) 44px 56px;
    background:var(--sb-bg);
    color:var(--sb-ink);
    font:14.5px/1.55 var(--sb-font-sans);
    overflow-x:hidden;
    overflow-y:auto;
    overscroll-behavior:contain;
    scrollbar-gutter:stable;
  }
  .dsh-sb-inner{max-width:1400px}
  .dsh-sb-chrome{display:flex;justify-content:flex-start;align-items:center;gap:10px;width:100%;max-width:1000px;margin:0 auto;padding:0 0 18px;border:0;color:var(--sb-muted);font:12px/1.4 var(--sb-font-sans);letter-spacing:0;text-transform:none}
  .dsh-sb-crumb{color:var(--sb-muted)}
  .dsh-sb-crumb.is-current{color:var(--sb-ink-2);font-weight:600}
  .dsh-sb-hero{display:flex;justify-content:flex-start;align-items:flex-end;gap:26px;padding:6px 0 24px;border:0}
  .dsh-sb-hero-main{width:100%;max-width:1000px;margin:0 auto;text-align:left}
  .dsh-sb-hero-index{display:none}
  .dsh-sb-kicker{margin:0 0 9px;color:var(--sb-accent);font:700 10px/1.2 var(--sb-font-sans);letter-spacing:.19em;text-transform:uppercase}
  .dsh-sb-title{margin:0;color:var(--sb-ink);font:680 40px/1.1 var(--sb-font-sans);letter-spacing:-.045em}
  .dsh-sb-title-badge{display:inline-block;margin-left:10px;padding:5px 9px 4px;border-radius:5px;background:var(--sb-accent-soft);color:var(--sb-accent);font-size:11px;font-weight:600;letter-spacing:0;vertical-align:8px}
  .dsh-sb-subtitle{max-width:680px;margin:12px 0 0;color:var(--sb-muted);font-size:14px;line-height:1.65}
  .dsh-sb-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;border:0;margin-bottom:22px}
  .dsh-sb-stat{display:flex;flex-direction:row;align-items:center;gap:16px;min-height:86px;padding:18px 22px;background:var(--sb-surface);border:1px solid var(--sb-line);border-radius:14px;box-shadow:0 2px 10px rgba(27,39,64,.04)}
  .dsh-sb-stat.is-soft,.dsh-sb-stat.is-accent{background:var(--sb-surface);color:var(--sb-ink);border-right:1px solid var(--sb-line)}
  .dsh-sb-stat-icon{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;flex:0 0 38px;border-radius:10px;background:var(--sb-icon-bg);color:var(--sb-icon-ink)}
  .dsh-sb-stat:nth-child(2) .dsh-sb-stat-icon{background:var(--sb-accent-soft);color:var(--sb-accent)}
  .dsh-sb-stat:nth-child(3) .dsh-sb-stat-icon{background:var(--sb-mint-soft);color:var(--sb-mint)}
  .dsh-sb-stat-copy{display:flex;flex-direction:column;gap:7px;min-width:0}
  .dsh-sb-stat-number{color:var(--sb-ink);font:680 30px/1 var(--sb-font-sans);letter-spacing:-.04em;font-variant-numeric:tabular-nums}
  .dsh-sb-stat-label{color:var(--sb-muted);font-size:12px;font-weight:400;line-height:1}
  .dsh-sb-stat-note{display:none}
  .dsh-sb-workspace{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:22px;align-items:start;padding-top:0}
  .dsh-sb-main{display:flex;flex-direction:column;gap:22px;min-width:0}
  .dsh-sb-section{background:var(--sb-surface);border:1px solid var(--sb-line);border-radius:18px;box-shadow:0 3px 14px rgba(26,38,60,.04);padding:26px 30px 12px}
  .dsh-sb-section-head{display:flex;align-items:flex-start;gap:12px;padding:0;border:0;margin-bottom:0}
  .dsh-sb-section-num{flex:0 0 auto;padding:4px 7px;border-radius:4px;background:var(--sb-accent-soft);color:var(--sb-accent);font:700 10px/1 var(--sb-font-mono);letter-spacing:.06em}
  .dsh-sb-section-title h2{margin:7px 0 0;color:var(--sb-ink);font:680 22px/1.25 var(--sb-font-sans);letter-spacing:-.02em}
  .dsh-sb-section-title p{max-width:44em;margin:7px 0 0;color:var(--sb-muted);font-size:13px;line-height:1.6}
  .dsh-sb-toolbar{display:flex;flex-wrap:wrap;align-items:stretch;gap:10px;margin:22px 0 8px}
  .dsh-sb-search{position:relative;flex:1 1 280px;min-width:200px}
  .dsh-sb-search svg{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--sb-muted);pointer-events:none}
  .dsh-sb-search input{width:100%;height:42px;padding:0 13px 0 40px;border:1px solid var(--sb-line);border-radius:9px;background:var(--sb-surface);color:var(--sb-ink);font-size:12.5px;outline:none}
  .dsh-sb-search input:focus{border-color:var(--sb-accent);box-shadow:0 0 0 3px var(--sb-accent-soft)}
  .dsh-sb-search input::placeholder{color:var(--sb-preview-muted)}
  .dsh-sb-actions{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
  .dsh-sb-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:36px;padding:0 12px;border:0;border-radius:7px;background:transparent;color:var(--sb-muted);font:12px/1 var(--sb-font-sans);letter-spacing:0;text-transform:none;white-space:nowrap}
  .dsh-sb-btn:hover:not(:disabled){background:var(--sb-surface-2);color:var(--sb-accent)}
  .dsh-sb-btn.is-primary{background:var(--sb-accent);color:var(--sb-accent-on)}
  .dsh-sb-btn.is-primary:hover:not(:disabled){background:var(--sb-accent);filter:brightness(.95)}
  .dsh-sb-btn.is-danger{background:transparent;color:#df7865;text-decoration:none}
  .dsh-sb-btn.is-danger:hover:not(:disabled){background:transparent;color:#c95b48}
  .dsh-sb-selection{padding:10px 0 12px;border-bottom:1px solid var(--sb-line);color:var(--sb-muted);font:12px/1.4 var(--sb-font-sans);letter-spacing:0;text-transform:none}
  .dsh-sb-link{color:var(--sb-accent);font:inherit;text-decoration:none}
  .dsh-sb-list{display:flex;flex-direction:column;border:0;margin-top:4px}
  .dsh-sb-row{display:grid;grid-template-columns:22px 18px 40px minmax(0,1fr) auto;align-items:center;gap:12px;min-height:78px;padding:12px 4px;background:transparent;border-bottom:1px solid var(--sb-row-line);transition:background .15s ease,box-shadow .15s ease}
  .dsh-sb-row:hover{background:var(--sb-hover)}
  .dsh-sb-row.is-dragover{box-shadow:inset 3px 0 0 var(--sb-accent);background:var(--sb-accent-soft)}
  .dsh-sb-row-meta{display:flex;align-items:center;justify-content:center;color:var(--sb-muted);font:10px var(--sb-font-mono)}
  .dsh-sb-row-meta > span:first-child{display:none}
  .dsh-sb-check{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px}
  .dsh-sb-check input{width:16px;height:16px;accent-color:var(--sb-accent);cursor:pointer}
  .dsh-sb-drag{display:inline-flex;align-items:center;justify-content:center;width:18px;height:28px;color:#c0c9d6;cursor:grab;font-size:13px;letter-spacing:-2px;user-select:none}
  .dsh-sb-drag:active{cursor:grabbing}
  .dsh-sb-ico{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;background:var(--sb-icon-bg);color:var(--sb-icon-ink);border-radius:10px;transition:background .15s ease,color .15s ease}
  .dsh-sb-row[data-collected="true"] .dsh-sb-ico{background:var(--sb-accent-soft);color:var(--sb-accent)}
  .dsh-sb-line1{display:flex;align-items:center;gap:9px;min-width:0}
  .dsh-sb-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--sb-ink);font-size:14.5px;font-weight:600;letter-spacing:-.01em}
  .dsh-sb-badge{display:inline-flex;align-items:center;height:19px;padding:0 6px;border-radius:3px;background:var(--sb-accent-soft);color:var(--sb-accent);font:11px var(--sb-font-sans);letter-spacing:0}
  .dsh-sb-badge.is-muted{background:var(--sb-chip-bg);color:var(--sb-chip-ink)}
  .dsh-sb-line2{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-top:5px;color:var(--sb-muted);font-size:12px}
  .dsh-sb-source{max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--sb-muted);font:11.5px var(--sb-font-sans);letter-spacing:.02em;text-transform:none}
  .dsh-sb-controls{display:flex;align-items:center;gap:7px;justify-content:flex-end}
  .dsh-sb-star,.dsh-sb-iconbtn{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;padding:0;border:0;border-radius:6px;background:transparent;color:#c1cad7;font-size:16px}
  .dsh-sb-star:hover,.dsh-sb-iconbtn:hover{background:var(--sb-surface-2);color:var(--sb-accent)}
  .dsh-sb-star.is-on{color:var(--sb-amber)}
  .dsh-sb-star.is-on:hover{color:var(--sb-amber)}
  .dsh-sb-seg{display:inline-flex;padding:2px;border:0;border-radius:7px;background:var(--sb-chip-bg)}
  .dsh-sb-seg-btn{height:30px;padding:0 10px;border:0;border-radius:5px;background:transparent;color:var(--sb-chip-ink);font:11.5px var(--sb-font-sans);letter-spacing:0;text-transform:none}
  .dsh-sb-seg-btn.is-on{background:var(--sb-seg-on);color:var(--sb-accent);box-shadow:0 1px 2px rgba(24,40,80,.12)}
  .dsh-sb-move{display:inline-flex;flex-direction:column;gap:1px}
  .dsh-sb-move button{display:inline-flex;align-items:center;justify-content:center;width:18px;height:15px;padding:0;border:0;border-radius:3px;background:transparent;color:#b1bdcb;font-size:10px;line-height:1}
  .dsh-sb-move button:hover:not(:disabled){background:var(--sb-surface-2);color:var(--sb-accent)}
  .dsh-sb-empty{padding:32px 18px;text-align:center;border-bottom:1px solid var(--sb-line);color:var(--sb-muted)}
  .dsh-sb-empty strong{display:block;margin-bottom:6px;color:var(--sb-ink);font-size:15px;font-weight:600}
  .dsh-sb-empty span{font-size:13px}
  .dsh-sb-input{height:38px;padding:0 12px;border:1px solid var(--sb-line);border-radius:8px;background:var(--sb-surface);color:var(--sb-ink);font-size:12px;outline:none}
  .dsh-sb-input:focus{border-color:var(--sb-accent);box-shadow:0 0 0 3px var(--sb-accent-soft)}
  .dsh-sb-rail{position:sticky;top:calc(var(--dsh-frame-top-clearance,48px) + 24px);display:flex;flex-direction:column;gap:16px}
  .dsh-sb-preview{overflow:hidden;padding:0;border:1px solid var(--sb-line);border-radius:18px;background:var(--sb-surface);color:var(--sb-ink);box-shadow:0 3px 14px rgba(26,38,60,.04)}
  .dsh-sb-preview-kicker{padding:20px 22px 0;color:var(--sb-muted);font:10px var(--sb-font-sans);letter-spacing:.15em;text-transform:uppercase}
  .dsh-sb-preview-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 22px 16px;border-bottom:1px solid var(--sb-line);background:var(--sb-surface);color:var(--sb-ink)}
  .dsh-sb-preview-title{color:var(--sb-ink);font:680 21px/1.15 var(--sb-font-sans);letter-spacing:-.03em}
  .dsh-sb-preview-count{display:inline-flex;align-items:center;justify-content:center;min-width:27px;height:27px;padding:0 8px;border-radius:999px;background:var(--sb-accent-soft);color:var(--sb-accent);font:600 13px/1 var(--sb-font-sans);letter-spacing:0;font-variant-numeric:tabular-nums}
  .dsh-sb-preview-row{display:grid;grid-template-columns:26px minmax(0,1fr) 16px;gap:12px;align-items:center;width:100%;min-height:52px;padding:14px 22px;border:0;border-bottom:1px solid var(--sb-preview-line);background:var(--sb-surface);color:var(--sb-ink);font:inherit;text-align:left;cursor:pointer;transition:background .12s ease}
  .dsh-sb-preview-row:last-child{border-bottom:0}
  .dsh-sb-preview-row:hover{background:var(--sb-hover)}
  .dsh-sb-preview-row:hover .dsh-sb-preview-name{color:var(--sb-accent)}
  .dsh-sb-preview-row:disabled{cursor:not-allowed;opacity:.45}
  .dsh-sb-preview-index{width:auto;color:var(--sb-preview-muted);font:11px var(--sb-font-mono);letter-spacing:.02em;font-variant-numeric:tabular-nums}
  .dsh-sb-preview-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:600;color:var(--sb-preview-text);transition:color .12s ease}
  .dsh-sb-preview-arrow{color:var(--sb-preview-muted);font-size:15px;line-height:1;text-align:right;transition:color .12s ease,transform .12s ease}
  .dsh-sb-preview-row:hover .dsh-sb-preview-arrow{color:var(--sb-accent);transform:translate(1px,-1px)}
  .dsh-sb-preview-empty{padding:22px 22px 19px;border-bottom:1px solid var(--sb-preview-line);background:var(--sb-surface)}
  .dsh-sb-preview-empty strong{display:block;margin-bottom:6px;color:var(--sb-preview-text);font-size:15px;font-weight:600}
  .dsh-sb-preview-empty span{color:var(--sb-preview-muted);font-size:12px;line-height:1.5}
  .dsh-sb-mini{padding:17px 18px;border:1px solid var(--sb-line);border-radius:14px;background:var(--sb-surface);box-shadow:0 3px 12px rgba(26,38,60,.035)}
  .dsh-sb-mini-title{padding-bottom:10px;border-bottom:1px solid var(--sb-row-line);color:var(--sb-muted);font:9px var(--sb-font-sans);letter-spacing:.16em;text-transform:uppercase}
  .dsh-sb-mini-row{display:flex;justify-content:space-between;gap:8px;align-items:baseline;padding:10px 0;border-bottom:1px solid var(--sb-row-line);color:var(--sb-ink-2);font-size:11px}
  .dsh-sb-mini-row:last-child{border-bottom:0}
  .dsh-sb-mini-count{color:var(--sb-muted);font:10px var(--sb-font-sans)}
  .dsh-sb-mini-empty{padding:14px 0 2px;color:var(--sb-muted);font-size:10px}
  @media (max-width:1024px){
    .dsh-sb-workspace{grid-template-columns:1fr}
    .dsh-sb-rail{position:static;display:grid;grid-template-columns:1fr 1fr;gap:16px}
  }
  @media (max-width:760px){
    .dsh-sb-page{padding:calc(var(--dsh-frame-top-clearance,48px) + 16px) 16px 40px}
    .dsh-sb-chrome{padding-bottom:14px}
    .dsh-sb-hero{display:block;padding:10px 0 18px}
    .dsh-sb-hero-mark{margin-top:12px;text-align:left;align-items:flex-start}
    .dsh-sb-stats{grid-template-columns:1fr;gap:8px}
    .dsh-sb-stat{min-height:58px}
    .dsh-sb-row{grid-template-columns:22px 18px 40px minmax(0,1fr);gap:10px;padding:12px 2px}
    .dsh-sb-controls{grid-column:2/-1;justify-content:flex-start;flex-wrap:wrap;padding-left:40px}
    .dsh-sb-rail{grid-template-columns:1fr}
  }
`
    const ICON_PATHS = {
      box: [
        ['path', { d: 'M4 8.5 12 4l8 4.5V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8.5Z' }],
        ['path', { d: 'M4 10h5.2c.5 0 .9.3 1.1.8l.6 1.4c.2.5.6.8 1.1.8h2c.5 0 .9-.3 1.1-.8l.6-1.4c.2-.5.6-.8 1.1-.8H20' }],
      ],
      market: [
        ['path', { d: 'M4 9h16v10.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19.5V9Z' }],
        ['path', { d: 'M3.5 9 5 4h14l1.5 5a3 3 0 0 1-5.5 1.8A3 3 0 0 1 12 12a3 3 0 0 1-3-1.2A3 3 0 0 1 3.5 9Z' }],
      ],
      search: [
        ['circle', { cx: '10.5', cy: '10.5', r: '6.2' }],
        ['path', { d: 'm15.2 15.2 4.3 4.3' }],
      ],
      trash: [
        ['path', { d: 'M4 7h16' }],
        ['path', { d: 'M9 7V4.8c0-.4.4-.8.8-.8h4.4c.4 0 .8.4.8.8V7' }],
        ['path', { d: 'M6.5 7 7.4 20a1 1 0 0 0 1 .9h7.2a1 1 0 0 0 1-.9L17.5 7' }],
        ['path', { d: 'M10 11v6M14 11v6' }],
      ],
      terminal: [
        ['rect', { x: '3.5', y: '4.5', width: '17', height: '15', rx: '2' }],
        ['path', { d: 'm7 9 3 3-3 3M12.5 15h4.5' }],
      ],
    }

    function Glyph({ name, size = 16, active = false }) {
      const paths = ICON_PATHS[name] || ICON_PATHS.box
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: active ? 2 : 1.7,
        strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true',
        style: { display: 'block' },
      }, paths.map(([tag, attrs], index) => h(tag, { ...attrs, key: index })))
    }

    function BoxGlyph({ size = 18, active = false }) {
      return h(Glyph, { name: 'box', size, active })
    }

    function safeJsonParse(text) {
      try { return JSON.parse(text) } catch { return null }
    }

    function defaultPrefs() {
      const entries = {}
      for (const meta of MANAGED) entries[meta.id] = { collected: false, favorite: false, name: '' }
      return { version: 1, entries, order: DEFAULT_ORDER.slice() }
    }

    function sanitizePrefs(raw) {
      const base = defaultPrefs()
      if (raw === null || typeof raw !== 'object') return base
      const entries = {}
      const rawEntries = raw.entries && typeof raw.entries === 'object' ? raw.entries : {}
      const ids = new Set(MANAGED.map(meta => meta.id))
      for (const id of Object.keys(rawEntries)) {
        if (typeof id === 'string' && id.length > 0 && id.length <= 120 && id !== PANEL_ID && id !== 'plugins') ids.add(id)
      }
      for (const id of ids) {
        const value = rawEntries[id]
        entries[id] = {
          collected: Boolean(value && value.collected),
          favorite: Boolean(value && value.favorite),
          name: value && typeof value.name === 'string' ? value.name.slice(0, 30) : '',
        }
      }
      let order = Array.isArray(raw.order) ? raw.order.filter(id => typeof id === 'string' && entries[id] !== undefined) : []
      order = Array.from(new Set(order))
      for (const id of Object.keys(entries)) if (!order.includes(id)) order.push(id)
      return { version: 1, entries, order }
    }

    function readPrefs() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        return raw === null ? defaultPrefs() : sanitizePrefs(safeJsonParse(raw))
      } catch { return defaultPrefs() }
    }

    function createPrefsStore() {
      let state = readPrefs()
      const listeners = new Set()
      function emit() { for (const listener of listeners) listener() }
      function persist() {
        try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* storage may be unavailable */ }
      }
      function set(next) {
        state = sanitizePrefs(next)
        persist()
        emit()
      }
      function update(updater) { set(updater(state)) }
      return {
        get: () => state,
        subscribe(listener) {
          listeners.add(listener)
          return () => listeners.delete(listener)
        },
        setCollected(id, value) {
          update(current => {
            const next = { ...current, entries: { ...current.entries } }
            next.entries[id] = { ...next.entries[id], collected: Boolean(value) }
            return next
          })
        },
        batchSet(ids, value) {
          update(current => {
            const next = { ...current, entries: { ...current.entries } }
            for (const id of ids) if (next.entries[id]) next.entries[id] = { ...next.entries[id], collected: Boolean(value) }
            return next
          })
        },
        ensure(ids) {
          update(current => {
            const entries = { ...current.entries }
            const order = current.order.slice()
            let changed = false
            for (const id of ids || []) {
              if (typeof id !== 'string' || id === '' || id === PANEL_ID || id === 'plugins' || entries[id]) continue
              entries[id] = { collected: false, favorite: false, name: '' }
              order.push(id)
              changed = true
            }
            return changed ? { ...current, entries, order } : current
          })
        },
        toggleFavorite(id) {
          update(current => {
            const next = { ...current, entries: { ...current.entries } }
            next.entries[id] = { ...next.entries[id], favorite: !next.entries[id].favorite }
            return next
          })
        },
        setName(id, name) {
          update(current => {
            const next = { ...current, entries: { ...current.entries } }
            next.entries[id] = { ...next.entries[id], name: String(name || '').trim().slice(0, 30) }
            return next
          })
        },
        moveEntry(id, delta) {
          update(current => {
            const order = current.order.slice()
            const at = order.indexOf(id)
            const target = at + delta
            if (at < 0 || target < 0 || target >= order.length) return current
            order.splice(at, 1)
            order.splice(target, 0, id)
            return { ...current, order }
          })
        },
        reorderEntry(fromId, toId) {
          update(current => {
            const order = current.order.slice()
            const from = order.indexOf(fromId)
            const to = order.indexOf(toId)
            if (from < 0 || to < 0 || from === to) return current
            order.splice(from, 1)
            order.splice(to, 0, fromId)
            return { ...current, order }
          })
        },
        reset() { set(defaultPrefs()) },
      }
    }

    function createRegistry(slots) {
      let map = new Map()
      let version = 0
      const listeners = new Set()
      function sameMap(a, b) {
        if (a.size !== b.size) return false
        for (const [key, value] of a) {
          const other = b.get(key)
          if (!other || other.label !== value.label || other.component !== value.component) return false
        }
        return true
      }
      function refresh() {
        const next = new Map()
        try {
          const entries = slots && typeof slots.entries === 'function' ? slots.entries('sidebar.panellist') : []
          for (const entry of entries || []) {
            const id = entry && entry.options ? entry.options.id : undefined
            if (!id) continue
            let label = entry.options.label
            if (typeof label === 'function') {
              try { label = label() } catch { label = '' }
            }
            next.set(id, {
              label: typeof label === 'string' ? label : '',
              component: entry.component,
              order: Number(entry.options.order) || 0,
            })
          }
        } catch { /* slot not ready yet */ }
        if (sameMap(map, next)) return
        map = next
        version += 1
        for (const listener of listeners) listener()
      }
      return {
        refresh,
        get: id => map.get(id),
        has: id => map.has(id),
        ids: () => Array.from(map.keys()),
        subscribe(listener) {
          listeners.add(listener)
          return () => listeners.delete(listener)
        },
        getVersion: () => version,
      }
    }

    function usePrefs(store) {
      return React.useSyncExternalStore(store.subscribe, store.get, store.get)
    }

    function useRegistry(registry) {
      return React.useSyncExternalStore(registry.subscribe, registry.getVersion, registry.getVersion)
    }

    function useLocale(ctx) {
      const locale = ctx.locale
      return React.useSyncExternalStore(
        listener => locale.subscribe(listener),
        () => locale.getSnapshot(),
        () => locale.getSnapshot(),
      )
    }

    function langOf(snapshot) {
      const active = snapshot && snapshot.active ? String(snapshot.active).toLowerCase() : 'zh'
      return active.startsWith('zh') ? 'zh' : 'en'
    }

    class IconBoundary extends React.Component {
      constructor(props) {
        super(props)
        this.state = { failed: false }
      }
      static getDerivedStateFromError() { return { failed: true } }
      render() { return this.state.failed ? this.props.fallback : this.props.children }
    }

    function makeClient(ctx) {
      const slots = ctx.slots
      const store = createPrefsStore()
      const registry = createRegistry(slots)
      const t = ctx.locale.bind(NS)
      let layout = null
      try {
        ctx.inject(['layout'], scope => {
          layout = scope.layout
          return () => { if (layout === scope.layout) layout = null }
        })
      } catch { /* optional service */ }

      function openPanel(id) {
        try { if (layout && typeof layout.selectPanel === 'function') layout.selectPanel(id) } catch (error) { console.warn('[sidebar-box] cannot open panel', id, error) }
      }

      function labelOf(id, lang) {
        const record = store.get().entries[id]
        if (record && record.name) return record.name
        const registered = registry.get(id)
        if (registered && registered.label) return registered.label
        const meta = MANAGED_BY_ID.get(id)
        return meta ? (lang === 'zh' ? meta.zh : meta.en) : id
      }

      function EntryIcon({ id, size = 16, active = false }) {
        useRegistry(registry)
        const meta = MANAGED_BY_ID.get(id)
        const fallback = h(Glyph, { name: meta ? meta.glyph : 'box', size, active })
        const entry = registry.get(id)
        if (!entry || typeof entry.component !== 'function') return fallback
        return h(IconBoundary, { fallback, key: id }, h(entry.component, { size, active }))
      }

      function SearchGlyph({ size = 14 }) { return h(Glyph, { name: 'search', size }) }

      function ManagerPage() {
        usePrefs(store)
        const registryVersion = useRegistry(registry)
        const localeSnapshot = useLocale(ctx)
        const lang = langOf(localeSnapshot)
        const prefs = store.get()
        React.useEffect(() => {
          const ids = typeof registry.ids === 'function' ? registry.ids() : []
          store.ensure([...MANAGED.map(meta => meta.id), ...ids])
        }, [registryVersion])
        const [query, setQuery] = React.useState('')
        const [selected, setSelected] = React.useState([])
        const [editingId, setEditingId] = React.useState(null)
        const [draftName, setDraftName] = React.useState('')
        const [dragId, setDragId] = React.useState(null)
        const [dragOverId, setDragOverId] = React.useState(null)

        const term = query.trim().toLowerCase()
        const filtered = prefs.order.filter(id => {
          if (term === '') return true
          const name = labelOf(id, lang).toLowerCase()
          const meta = MANAGED_BY_ID.get(id)
          const source = meta ? meta.source.toLowerCase() : ''
          return name.includes(term) || source.includes(term) || id.toLowerCase().includes(term)
        })
        const collectedIds = []
        const collectedNames = new Set()
        for (const id of prefs.order) {
          const record = prefs.entries[id]
          if (!record || !record.collected) continue
          const name = labelOf(id, lang).trim()
          if (!name || collectedNames.has(name)) continue
          collectedNames.add(name)
          collectedIds.push(id)
        }
        const stats = {
          managed: prefs.order.length,
          collected: collectedIds.length,
          shown: prefs.order.filter(id => !prefs.entries[id].collected || prefs.entries[id].favorite).length,
        }
        const allSelected = filtered.length > 0 && filtered.every(id => selected.includes(id))
        const selectedIds = selected.filter(id => prefs.entries[id] !== undefined)
        const batchIds = selectedIds.length > 0 ? selectedIds : filtered

        function toggleSelected(id) {
          setSelected(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id])
        }
        function toggleAll() {
          if (allSelected) setSelected(current => current.filter(id => !filtered.includes(id)))
          else setSelected(current => Array.from(new Set([...current, ...filtered])))
        }
        function startRename(id) {
          setEditingId(id)
          setDraftName(prefs.entries[id].name || '')
        }
        function finishRename(id) {
          store.setName(id, draftName)
          setEditingId(null)
          setDraftName('')
        }
        function resetAll() {
          if (window.confirm(t('toolbar.resetConfirm'))) {
            store.reset()
            store.ensure([...MANAGED.map(meta => meta.id), ...(typeof registry.ids === 'function' ? registry.ids() : [])])
            setSelected([])
            setQuery('')
          }
        }

        const rows = filtered.map((id, index) => {
          const record = prefs.entries[id]
          const meta = MANAGED_BY_ID.get(id)
          const name = labelOf(id, lang)
          const installed = registry.has(id)
          const isEditing = editingId === id
          const isOver = dragOverId === id
          return h('div', {
            className: 'dsh-sb-row' + (isOver ? ' is-dragover' : ''),
            key: id,
            onDragOver(event) {
              if (dragId === null || dragId === id) return
              event.preventDefault()
              if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
              setDragOverId(id)
            },
            onDragLeave() { if (dragOverId === id) setDragOverId(null) },
            onDrop(event) {
              event.preventDefault()
              if (dragId !== null && dragId !== id) store.reorderEntry(dragId, id)
              setDragId(null)
              setDragOverId(null)
            },
          },
          h('div', { className: 'dsh-sb-row-meta' },
            h('span', { 'aria-hidden': 'true' }, String(index + 1).padStart(2, '0')),
            h('label', { className: 'dsh-sb-check', title: t('row.select', { name }) },
              h('input', { type: 'checkbox', checked: selected.includes(id), onChange: () => toggleSelected(id), 'aria-label': t('row.select', { name }) }),
            ),
          ),
          h('span', {
            className: 'dsh-sb-drag', draggable: true, title: t('row.drag', { name }), 'aria-hidden': 'true',
            onDragStart(event) {
              setDragId(id)
              if (event.dataTransfer) {
                event.dataTransfer.effectAllowed = 'move'
                try { event.dataTransfer.setData('text/plain', id) } catch { /* optional */ }
              }
            },
            onDragEnd() { setDragId(null); setDragOverId(null) },
          }, '⋮⋮'),
          h('span', { className: 'dsh-sb-ico', 'aria-hidden': 'true' }, h(EntryIcon, { id, size: 20 })),
          h('div', { className: 'dsh-sb-main' },
            h('div', { className: 'dsh-sb-line1' },
              isEditing
                ? h('input', {
                    className: 'dsh-sb-input', value: draftName, maxLength: 30, autoFocus: true,
                    'aria-label': t('row.rename', { name }),
                    onChange: event => setDraftName(event.target.value),
                    onBlur: () => finishRename(id),
                    onKeyDown: event => {
                      if (event.key === 'Enter') { event.preventDefault(); finishRename(id) }
                      if (event.key === 'Escape') { event.preventDefault(); setEditingId(null); setDraftName('') }
                    },
                  })
                : h('span', { className: 'dsh-sb-name', title: name }, name),
              !installed && h('span', { className: 'dsh-sb-badge is-muted' }, t('row.unavailable')),
              !isEditing && h('button', {
                type: 'button', className: 'dsh-sb-iconbtn', title: t('row.rename', { name }), 'aria-label': t('row.rename', { name }),
                onClick: () => startRename(id),
              }, '✎'),
            ),
            h('div', { className: 'dsh-sb-line2' },
              h('span', { className: 'dsh-sb-source', title: meta ? meta.source : id }, t('row.source', { source: meta ? meta.source : id })),
              record.favorite && record.collected && h('span', { className: 'dsh-sb-badge' }, t('row.favoriteHint')),
            ),
          ),
          h('div', { className: 'dsh-sb-controls' },
            h('button', {
              type: 'button', className: 'dsh-sb-star' + (record.favorite ? ' is-on' : ''),
              title: record.favorite ? t('row.favoriteOn') : t('row.favorite'),
              'aria-label': record.favorite ? t('row.favoriteOn') : t('row.favorite'),
              'aria-pressed': record.favorite,
              onClick: () => store.toggleFavorite(id),
            }, record.favorite ? '★' : '☆'),
            h('div', { className: 'dsh-sb-seg', role: 'group', 'aria-label': t('row.state') },
              h('button', {
                type: 'button', className: 'dsh-sb-seg-btn' + (!record.collected ? ' is-on' : ''),
                'aria-pressed': !record.collected, onClick: () => store.setCollected(id, false),
              }, t('row.visible')),
              h('button', {
                type: 'button', className: 'dsh-sb-seg-btn' + (record.collected ? ' is-on' : ''),
                'aria-pressed': record.collected, onClick: () => store.setCollected(id, true),
              }, t('row.collected')),
            ),
            h('div', { className: 'dsh-sb-move' },
              h('button', { type: 'button', disabled: index === 0, title: t('row.moveUp', { name }), 'aria-label': t('row.moveUp', { name }), onClick: () => store.moveEntry(id, -1) }, '▲'),
              h('button', { type: 'button', disabled: index === filtered.length - 1, title: t('row.moveDown', { name }), 'aria-label': t('row.moveDown', { name }), onClick: () => store.moveEntry(id, 1) }, '▼'),
            ),
            h('button', {
              type: 'button', className: 'dsh-sb-iconbtn', disabled: !installed,
              title: installed ? t('row.open', { name }) : t('row.unavailable'), 'aria-label': installed ? t('row.open', { name }) : t('row.unavailable'),
              onClick: () => { if (installed) openPanel(id) },
            }, '↗'),
          ))
        })

        return h('div', { className: 'dsh-sb-page', 'data-dsh-sidebar-box-page': '' },
          h('div', { className: 'dsh-sb-inner' },
            h('div', { className: 'dsh-sb-chrome' },
              h('span', { className: 'dsh-sb-crumb' }, t('page.system')),
              h('span', { className: 'dsh-sb-crumb' }, '/'),
              h('span', { className: 'dsh-sb-crumb is-current' }, t('page.title')),
            ),
            h('header', { className: 'dsh-sb-hero' },
              h('span', { className: 'dsh-sb-hero-index', 'aria-hidden': 'true' }, '01'),
              h('div', { className: 'dsh-sb-hero-main' },
                h('div', { className: 'dsh-sb-kicker' }, t('page.kicker')),
                h('h1', { className: 'dsh-sb-title' }, t('page.title'), h('span', { className: 'dsh-sb-title-badge' }, t('page.badge', { count: stats.managed }))),
                h('p', { className: 'dsh-sb-subtitle' }, t('page.desc')),
              ),
            ),
            h('div', { className: 'dsh-sb-stats' },
              h('div', { className: 'dsh-sb-stat is-soft' },
                h('span', { className: 'dsh-sb-stat-icon', 'aria-hidden': 'true' }, h(Glyph, { name: 'grid', size: 16 })),
                h('div', { className: 'dsh-sb-stat-copy' },
                  h('span', { className: 'dsh-sb-stat-number' }, String(stats.managed).padStart(2, '0')),
                  h('span', { className: 'dsh-sb-stat-label' }, t('summary.managed')),
                  h('span', { className: 'dsh-sb-stat-note' }, 'TOTAL'),
                ),
              ),
              h('div', { className: 'dsh-sb-stat is-accent' },
                h('span', { className: 'dsh-sb-stat-icon', 'aria-hidden': 'true' }, h(Glyph, { name: 'box', size: 16 })),
                h('div', { className: 'dsh-sb-stat-copy' },
                  h('span', { className: 'dsh-sb-stat-number' }, String(stats.collected).padStart(2, '0')),
                  h('span', { className: 'dsh-sb-stat-label' }, t('summary.collected')),
                  h('span', { className: 'dsh-sb-stat-note' }, 'IN THE BOX'),
                ),
              ),
              h('div', { className: 'dsh-sb-stat' },
                h('span', { className: 'dsh-sb-stat-icon', 'aria-hidden': 'true' }, h(Glyph, { name: 'search', size: 16 })),
                h('div', { className: 'dsh-sb-stat-copy' },
                  h('span', { className: 'dsh-sb-stat-number' }, String(stats.shown).padStart(2, '0')),
                  h('span', { className: 'dsh-sb-stat-label' }, t('summary.shown')),
                  h('span', { className: 'dsh-sb-stat-note' }, 'ON SIDEBAR'),
                ),
              ),
            ),
            h('div', { className: 'dsh-sb-workspace' },
              h('div', { className: 'dsh-sb-main' },
                h('section', { className: 'dsh-sb-section' },
                  h('div', { className: 'dsh-sb-section-head' },
                    h('span', { className: 'dsh-sb-section-num', 'aria-hidden': 'true' }, '01'),
                    h('div', { className: 'dsh-sb-section-title' },
                      h('h2', null, t('section.entries')),
                      h('p', null, t('section.entriesDesc')),
                    ),
                  ),
                  h('div', { className: 'dsh-sb-toolbar' },
                    h('div', { className: 'dsh-sb-search' },
                      h(SearchGlyph, { size: 14 }),
                      h('input', { type: 'search', value: query, placeholder: t('toolbar.search'), 'aria-label': t('toolbar.search'), onChange: event => setQuery(event.target.value) }),
                    ),
                    h('div', { className: 'dsh-sb-actions' },
                      h('button', { type: 'button', className: 'dsh-sb-btn', onClick: toggleAll, 'aria-pressed': allSelected }, t('toolbar.selectAll')),
                      h('button', { type: 'button', className: 'dsh-sb-btn is-primary', onClick: () => store.batchSet(batchIds, true) }, t('toolbar.collect')),
                      h('button', { type: 'button', className: 'dsh-sb-btn', onClick: () => store.batchSet(batchIds, false) }, t('toolbar.show')),
                      h('button', { type: 'button', className: 'dsh-sb-btn is-danger', onClick: resetAll }, t('toolbar.reset')),
                    ),
                  ),
                  selectedIds.length > 0 && h('div', { className: 'dsh-sb-selection' },
                    h('span', null, t('toolbar.selected', { count: selectedIds.length })),
                    h('button', { type: 'button', className: 'dsh-sb-link', onClick: () => setSelected([]) }, t('toolbar.clearSelection')),
                  ),
                  h('div', { className: 'dsh-sb-list' }, rows.length > 0 ? rows : h('div', { className: 'dsh-sb-empty' },
                    h('strong', null, t('menu.noMatch')),
                    h('span', null, t('menu.emptyHint')),
                  )),
                ),
              ),
              h('aside', { className: 'dsh-sb-rail' },
                h('section', { className: 'dsh-sb-preview' },
                  h('div', { className: 'dsh-sb-preview-kicker' }, t('preview.kicker')),
                  h('div', { className: 'dsh-sb-preview-head' },
                    h('span', { className: 'dsh-sb-preview-title' }, t('preview.title')),
                    h('span', { className: 'dsh-sb-preview-count' }, String(stats.collected)),
                  ),
                  collectedIds.length > 0
                    ? collectedIds.map((id, index) => {
                        const installed = registry.has(id)
                        return h('button', {
                          type: 'button', className: 'dsh-sb-preview-row', key: id, disabled: !installed,
                          title: installed ? t('row.open', { name: labelOf(id, lang) }) : t('row.unavailable'),
                          onClick: () => { if (installed) openPanel(id) },
                        },
                        h('span', { className: 'dsh-sb-preview-index' }, String(index + 1).padStart(2, '0')),
                        h('span', { className: 'dsh-sb-preview-name' }, labelOf(id, lang)),
                        h('span', { className: 'dsh-sb-preview-arrow' }, '↗'),
                        )
                      })
                    : h('div', { className: 'dsh-sb-preview-empty' },
                        h('strong', null, t('preview.empty')),
                        h('span', null, t('preview.emptyHint')),
                      ),
                ),
              ),
            ),
          ),
        )
      }

      function SidebarIcon({ size = 16, active = false }) {
        return h(BoxGlyph, { size, active })
      }

      function installStyles() {
        const style = document.createElement('style')
        style.setAttribute('data-dsh-sidebar-box', '')
        style.textContent = CSS
        document.head.appendChild(style)
        return () => { try { style.remove() } catch { /* already gone */ } }
      }

      function createSidebarSync() {
        let observer = null
        let scheduled = false
        let stopStore = null
        let stopRegistry = null

        function findNavs() {
          const navs = []
          for (const nav of document.querySelectorAll('nav')) {
            if (nav.querySelector('button[aria-haspopup="menu"]') && nav.querySelector('button[aria-label]')) navs.push(nav)
          }
          return navs
        }
        function directChildOf(nav, element) {
          let current = element
          while (current && current.parentElement && current.parentElement !== nav) current = current.parentElement
          return current && current.parentElement === nav ? current : null
        }
        function findButton(nav, id) {
          const tagged = nav.querySelector('button[data-dsh-sb-id="' + id + '"]')
          if (tagged) return tagged
          const meta = MANAGED_BY_ID.get(id)
          const registered = registry.get(id)
          const labels = []
          if (registered && registered.label) labels.push(registered.label)
          if (meta) labels.push(meta.zh, meta.en)
          for (const button of nav.querySelectorAll('button[aria-label]')) {
            if (button.hasAttribute('aria-haspopup')) continue
            const native = button.getAttribute('data-dsh-sb-native-label') || button.getAttribute('aria-label')
            if (labels.includes(native)) return button
          }
          return null
        }
        function applyName(button, name) {
          const title = button.querySelector('span[class*="panelTitle"]') || Array.from(button.querySelectorAll('span')).find(span => span.children.length === 0 && span.textContent === (button.getAttribute('aria-label') || ''))
          if (name !== '') {
            if (!button.hasAttribute('data-dsh-sb-native-label')) button.setAttribute('data-dsh-sb-native-label', button.getAttribute('aria-label') || '')
            if (title && !title.hasAttribute('data-dsh-sb-native-text')) title.setAttribute('data-dsh-sb-native-text', title.textContent || '')
            if (button.getAttribute('aria-label') !== name) button.setAttribute('aria-label', name)
            if (title && title.textContent !== name) title.textContent = name
            return
          }
          if (!button.hasAttribute('data-dsh-sb-native-label')) return
          const nativeLabel = button.getAttribute('data-dsh-sb-native-label') || ''
          if (button.getAttribute('aria-label') !== nativeLabel) button.setAttribute('aria-label', nativeLabel)
          if (title && title.hasAttribute('data-dsh-sb-native-text')) title.textContent = title.getAttribute('data-dsh-sb-native-text')
          button.removeAttribute('data-dsh-sb-native-label')
          if (title) title.removeAttribute('data-dsh-sb-native-text')
        }
        function sync() {
          scheduled = false
          const prefs = store.get()
          for (const nav of findNavs()) {
            for (const id of prefs.order) {
              if (id === PANEL_ID || id === 'plugins') continue
              const button = findButton(nav, id)
              if (!button) continue
              if (!button.hasAttribute('data-dsh-sb-id')) button.setAttribute('data-dsh-sb-id', id)
              const wrapper = directChildOf(nav, button)
              if (!wrapper) continue
              const record = prefs.entries[id]
              if (!record) continue
              const hidden = record.collected && !record.favorite
              if (hidden && wrapper.getAttribute('data-dsh-sb-hidden') !== '') wrapper.setAttribute('data-dsh-sb-hidden', '')
              if (!hidden && wrapper.hasAttribute('data-dsh-sb-hidden')) wrapper.removeAttribute('data-dsh-sb-hidden')
              applyName(button, record.name || '')
            }
          }
        }
        function schedule() {
          if (scheduled) return
          scheduled = true
          queueMicrotask(sync)
        }
        function start() {
          const style = installStyles()
          try {
            observer = new MutationObserver(schedule)
            observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['aria-label', 'class'] })
          } catch { observer = null }
          stopStore = store.subscribe(schedule)
          stopRegistry = registry.subscribe(schedule)
          schedule()
          return () => {
            if (observer) { try { observer.disconnect() } catch { /* noop */ } }
            if (stopStore) stopStore()
            if (stopRegistry) stopRegistry()
            style()
            for (const button of document.querySelectorAll('button[data-dsh-sb-id]')) {
              const nativeLabel = button.getAttribute('data-dsh-sb-native-label')
              if (nativeLabel) button.setAttribute('aria-label', nativeLabel)
              const title = button.querySelector('span[data-dsh-sb-native-text]')
              if (title) title.textContent = title.getAttribute('data-dsh-sb-native-text')
              button.removeAttribute('data-dsh-sb-id')
              button.removeAttribute('data-dsh-sb-native-label')
            }
            for (const element of document.querySelectorAll('[data-dsh-sb-hidden]')) element.removeAttribute('data-dsh-sb-hidden')
          }
        }
        return { start }
      }

      return { ManagerPage, SidebarIcon, registry, store, createSidebarSync }
    }

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { en: EN, zh: ZH }), 'sidebar-box: dictionaries')
      const client = makeClient(ctx)
      const sidebarSync = client.createSidebarSync()
      ctx.effect(() => sidebarSync.start(), 'sidebar-box: reversible sidebar enhancement')

      ctx.slots.inject('sidebar.panellist', () => {
        const refresh = () => {
          client.registry.refresh()
          client.store.ensure(client.registry.ids())
        }
        refresh()
        try {
          const off = ctx.slots.subscribe ? ctx.slots.subscribe('sidebar.panellist', refresh) : null
          return () => { if (typeof off === 'function') off(); client.registry.refresh() }
        } catch {
          return () => { client.registry.refresh() }
        }
      })

      ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
        name: 'sidebar.panellist',
        id: PANEL_ID,
        order: 0.5,
        label: () => ctx.locale.bind(NS)('entry.label'),
      }, client.SidebarIcon))

      ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: PANEL_ID }, client.ManagerPage))
    }

    return {
      inject: ['slots', 'locale'],
      apply,
    }
  },
})
