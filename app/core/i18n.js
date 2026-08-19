const SUPPORTED_LANGUAGES = ['zh-CN', 'zh-TW', 'en'];

const FALLBACK_BUNDLES = {
  'zh-CN': {
    common: {
      actions: { enter: '进入工作台', back: '返回首页', close: '关闭', menu: '打开菜单', logout: '退出', save: '保存', cancel: '取消', confirm: '确认', delete: '删除', edit: '编辑', create: '新建' },
      navigation: '主导航', workspace: '工作台', language: '语言',
      languages: { zhCN: '简体中文', zhTW: '繁體中文', en: 'English' },
      loading: '加载中…', errors: { pageLoad: '页面加载失败', retry: '请稍后重试', load: '加载失败', save: '保存失败' },
      theme: { label: '主题模式', system: '系统', light: '浅色', dark: '深色' },
    },
    sidebar: { dashboard: '概览', notes: { _label: '笔记', list: '全部笔记', tags: '标签' }, settings: { _label: '设置', profile: '个人资料', display: '显示与语言', security: '安全会话', database: '数据库' } },
    landing: { eyebrow: '你的个人工作台', title: '把想法，整理成下一步。', lead: 'Nova 用清晰的模块、轻盈的交互和可靠的本地优先体验，让记录、复盘与行动回到同一个节奏里。', start: '开始使用', explore: '了解 Nova', preview: { title: '今日概览', status: '运行正常', notes: '条灵感笔记', modules: '个工作模块', window: '专注窗口', control: '掌控感' }, feature: { modular: { title: '模块化整理', description: '笔记、设置与概览各司其职，越用越顺手。' }, private: { title: '私密而可靠', description: '单密码鉴权与加密设置，让自托管也有安心边界。' }, focus: { title: '保持轻盈', description: '原生 Web Components 驱动，零依赖、快启动、低负担。' } } },
    auth: { welcome: '欢迎回到你的节奏。', intro: '一个安静、清晰、只属于你的工作台。', quote: '整理不是减法，是为重要的事留出空间。', loading: '正在准备…', loginTitle: '进入工作台', setupTitle: '设置管理密码', loginDescription: '输入密码继续，你的会话仅在选定的时间内有效。', setupDescription: '首次使用请设置一个至少 8 位的管理密码。', password: '管理密码', passwordPlaceholder: '请输入密码', passwordConfirm: '确认密码', passwordConfirmPlaceholder: '请再次输入密码', duration: '会话时长', secureHint: '你的凭证只用于本设备会话。', login: '登录', setup: '创建并进入', validation: { passwordLength: '密码至少需要 8 个字符', passwordMismatch: '两次输入的密码不一致' }, durationOptions: { '4h': '4 小时', '8h': '8 小时', '12h': '12 小时', '24h': '24 小时', '7d': '7 天', '14d': '14 天', '30d': '30 天', '90d': '90 天', session: '直到浏览器关闭' } },
  },
  'zh-TW': {
    common: {
      actions: { enter: '進入工作台', back: '返回首頁', close: '關閉', menu: '開啟選單', logout: '登出', save: '儲存', cancel: '取消', confirm: '確認', delete: '刪除', edit: '編輯', create: '新增' },
      navigation: '主導覽', workspace: '工作台', language: '語言',
      languages: { zhCN: '簡體中文', zhTW: '繁體中文', en: 'English' },
      loading: '載入中…', errors: { pageLoad: '頁面載入失敗', retry: '請稍後再試', load: '載入失敗', save: '儲存失敗' },
      theme: { label: '主題模式', system: '系統', light: '淺色', dark: '深色' },
    },
    sidebar: { dashboard: '概覽', notes: { _label: '筆記', list: '全部筆記', tags: '標籤' }, settings: { _label: '設定', profile: '個人資料', display: '顯示與語言', security: '安全工作階段', database: '資料庫' } },
    landing: { eyebrow: '你的個人工作台', title: '把想法，整理成下一步。', lead: 'Nova 用清晰的模組、輕盈的互動和可靠的本地優先體驗，讓記錄、回顧與行動回到同一個節奏裡。', start: '開始使用', explore: '了解 Nova', preview: { title: '今日概覽', status: '運行正常', notes: '條靈感筆記', modules: '個工作模組', window: '專注窗口', control: '掌控感' }, feature: { modular: { title: '模組化整理', description: '筆記、設定與概覽各司其職，越用越順手。' }, private: { title: '私密而可靠', description: '單密碼鑑權與加密設定，讓自託管也有安心邊界。' }, focus: { title: '保持輕盈', description: '原生 Web Components 驅動，零依賴、快啟動、低負擔。' } } },
    auth: { welcome: '歡迎回到你的節奏。', intro: '一個安靜、清晰、只屬於你的工作台。', quote: '整理不是減法，是為重要的事留出空間。', loading: '正在準備…', loginTitle: '進入工作台', setupTitle: '設定管理密碼', loginDescription: '輸入密碼繼續，你的工作階段只在選定時間內有效。', setupDescription: '首次使用請設定一個至少 8 位的管理密碼。', password: '管理密碼', passwordPlaceholder: '請輸入密碼', passwordConfirm: '確認密碼', passwordConfirmPlaceholder: '請再次輸入密碼', duration: '工作階段時長', secureHint: '你的憑證只用於本機工作階段。', login: '登入', setup: '建立並進入', validation: { passwordLength: '密碼至少需要 8 個字元', passwordMismatch: '兩次輸入的密碼不一致' }, durationOptions: { '4h': '4 小時', '8h': '8 小時', '12h': '12 小時', '24h': '24 小時', '7d': '7 天', '14d': '14 天', '30d': '30 天', '90d': '90 天', session: '直到瀏覽器關閉' } },
  },
  en: {
    common: {
      actions: { enter: 'Enter workspace', back: 'Back home', close: 'Close', menu: 'Open menu', logout: 'Log out', save: 'Save', cancel: 'Cancel', confirm: 'Confirm', delete: 'Delete', edit: 'Edit', create: 'Create' },
      navigation: 'Main navigation', workspace: 'Workspace', language: 'Language',
      languages: { zhCN: 'Simplified Chinese', zhTW: 'Traditional Chinese', en: 'English' },
      loading: 'Loading…', errors: { pageLoad: 'Page failed to load', retry: 'Please try again later', load: 'Loading failed', save: 'Save failed' },
      theme: { label: 'Theme mode', system: 'System', light: 'Light', dark: 'Dark' },
    },
    sidebar: { dashboard: 'Overview', notes: { _label: 'Notes', list: 'All notes', tags: 'Tags' }, settings: { _label: 'Settings', profile: 'Profile', display: 'Display & language', security: 'Security', database: 'Database' } },
    landing: { eyebrow: 'Your personal workspace', title: 'Turn ideas into the next step.', lead: 'Nova brings notes, reflection, and action into one steady rhythm through clear modules, light interactions, and a dependable local-first experience.', start: 'Get started', explore: 'Explore Nova', preview: { title: "Today's overview", status: 'All systems ready', notes: 'inspiration notes', modules: 'workspace modules', window: 'focus window', control: 'in control' }, feature: { modular: { title: 'Modular by design', description: 'Notes, settings, and overview each have a clear place.' }, private: { title: 'Private and reliable', description: 'Single-password auth and encrypted settings keep self-hosting calm.' }, focus: { title: 'Stay lightweight', description: 'Native Web Components mean zero dependencies and a fast start.' } } },
    auth: { welcome: 'Welcome back to your rhythm.', intro: 'A quiet, clear workspace that belongs to you.', quote: 'Organization is not subtraction; it makes room for what matters.', loading: 'Getting things ready…', loginTitle: 'Enter workspace', setupTitle: 'Set an admin password', loginDescription: 'Enter your password. Your session lasts only as long as you choose.', setupDescription: 'For first use, choose an admin password with at least 8 characters.', password: 'Admin password', passwordPlaceholder: 'Enter password', passwordConfirm: 'Confirm password', passwordConfirmPlaceholder: 'Enter the password again', duration: 'Session duration', secureHint: 'Your credential is used only for this device session.', login: 'Log in', setup: 'Create and enter', validation: { passwordLength: 'Password must be at least 8 characters', passwordMismatch: 'The passwords do not match' }, durationOptions: { '4h': '4 hours', '8h': '8 hours', '12h': '12 hours', '24h': '24 hours', '7d': '7 days', '14d': '14 days', '30d': '30 days', '90d': '90 days', session: 'Until browser closes' } },
  },
};

const FALLBACK_MODULE_BUNDLES = {
  'dashboard:zh-CN': { dashboard: { eyebrow: 'Nova / 概览', title: '今天，也从清晰开始。', subtitle: '把正在发生的事，放在看得见的位置。', newNote: '新建笔记', metrics: { notes: '笔记总数', modules: '活跃模块', ready: '就绪', status: '工作台状态' }, recent: { title: '最近更新', all: '查看全部', noContent: '暂无正文' }, empty: '还没有笔记，先记录一个想法吧。', tip: { title: 'Nova 小提示', description: '用短标题捕捉重点，再用正文留下上下文。', body: '好的整理，从下一步足够明确开始。' } } },
  'dashboard:zh-TW': { dashboard: { eyebrow: 'Nova / 概覽', title: '今天，也從清晰開始。', subtitle: '把正在發生的事，放在看得見的位置。', newNote: '新增筆記', metrics: { notes: '筆記總數', modules: '活躍模組', ready: '就緒', status: '工作台狀態' }, recent: { title: '最近更新', all: '查看全部', noContent: '暫無正文' }, empty: '還沒有筆記，先記錄一個想法吧。', tip: { title: 'Nova 小提示', description: '用短標題捕捉重點，再用正文留下上下文。', body: '好的整理，從下一步足夠明確開始。' } } },
  'dashboard:en': { dashboard: { eyebrow: 'Nova / Overview', title: 'Start today with clarity.', subtitle: 'Keep what is happening now within reach.', newNote: 'New note', metrics: { notes: 'Total notes', modules: 'Active modules', ready: 'Ready', status: 'Workspace status' }, recent: { title: 'Recently updated', all: 'View all', noContent: 'No content yet' }, empty: 'No notes yet. Capture your first idea.', tip: { title: 'A Nova note', description: 'Catch the point in a short title, then keep context in the body.', body: 'Good organization starts with a clear next step.' } } },
  'notes:zh-CN': { notes: { eyebrow: 'Nova / 笔记', title: '把值得留下的，放在这里。', subtitle: '从一个标题开始，给想法一个可以回来的地方。', new: '新建笔记', noContent: '暂无正文', badge: '已保存', empty: '这里还很安静，写下第一条笔记吧。', editor: { new: '新建笔记', edit: '编辑笔记', title: '标题', titlePlaceholder: '给这条记录一个清晰标题', content: '内容', contentPlaceholder: '记录上下文、链接或下一步…', cancel: '取消', save: '保存', titleRequired: '请输入标题' }, dialog: { deleteTitle: '删除笔记', deleteMessage: '确定删除“{{title}}”吗？此操作无法撤销。', delete: '删除', keep: '保留' } } },
  'notes:zh-TW': { notes: { eyebrow: 'Nova / 筆記', title: '把值得留下的，放在這裡。', subtitle: '從一個標題開始，給想法一個可以回來的地方。', new: '新增筆記', noContent: '暫無正文', badge: '已儲存', empty: '這裡還很安靜，寫下第一條筆記吧。', editor: { new: '新增筆記', edit: '編輯筆記', title: '標題', titlePlaceholder: '為這筆記錄一個清晰標題', content: '內容', contentPlaceholder: '記錄上下文、連結或下一步…', cancel: '取消', save: '儲存', titleRequired: '請輸入標題' }, dialog: { deleteTitle: '刪除筆記', deleteMessage: '確定刪除「{{title}}」嗎？此操作無法復原。', delete: '刪除', keep: '保留' } } },
  'notes:en': { notes: { eyebrow: 'Nova / Notes', title: 'Keep what is worth returning to.', subtitle: 'Start with a title and give ideas a place to come back to.', new: 'New note', noContent: 'No content yet', badge: 'Saved', empty: 'It is quiet here. Write your first note.', editor: { new: 'New note', edit: 'Edit note', title: 'Title', titlePlaceholder: 'Give this note a clear title', content: 'Content', contentPlaceholder: 'Capture context, links, or the next step…', cancel: 'Cancel', save: 'Save', titleRequired: 'Enter a title' }, dialog: { deleteTitle: 'Delete note', deleteMessage: 'Delete “{{title}}”? This cannot be undone.', delete: 'Delete', keep: 'Keep' } } },
  'notes/notes-list:zh-CN': { notesList: { title: '全部笔记', description: '按最近更新时间浏览你的记录。', empty: '暂无笔记', create: '新建笔记' } },
  'notes/notes-list:zh-TW': { notesList: { title: '全部筆記', description: '按最近更新時間瀏覽你的記錄。', empty: '暫無筆記', create: '新增筆記' } },
  'notes/notes-list:en': { notesList: { title: 'All notes', description: 'Browse your records by recent updates.', empty: 'No notes yet', create: 'New note' } },
  'notes/notes-tags:zh-CN': { notesTags: { title: '笔记标签', description: '用标签为不同主题建立轻量索引。', empty: '还没有标签，创建第一组主题吧。', create: '新建标签' } },
  'notes/notes-tags:zh-TW': { notesTags: { title: '筆記標籤', description: '用標籤為不同主題建立輕量索引。', empty: '還沒有標籤，建立第一組主題吧。', create: '新增標籤' } },
  'notes/notes-tags:en': { notesTags: { title: 'Note tags', description: 'Use tags to build a lightweight index for themes.', empty: 'No tags yet. Create your first theme.', create: 'New tag' } },
  'settings:zh-CN': { settings: { eyebrow: 'Nova / 设置', title: '让工作台适合你。', subtitle: '调整偏好、会话与数据边界。', saved: '设置已保存', tabs: { profile: '个人资料', display: '显示与语言', security: '安全会话', database: '数据库' }, profile: { title: '个人资料', description: '资料使用信封加密保存；没有配置密钥时不会写入敏感字段。', name: '称呼', namePlaceholder: '例如：小 Nova', email: '邮箱', address: '地址（可选）', addressPlaceholder: '仅在需要时填写' }, display: { title: '显示与语言', description: '选择 Nova 在不同设备上的呈现方式。', theme: '主题模式', themeHint: '系统模式会跟随设备偏好。', language: '语言' }, security: { title: '安全会话', description: '登录令牌只携带过期时间与随机数，不保存原始密码。', defaultDuration: '默认会话时长' }, database: { title: '数据库状态', description: 'Nova 通过适配器在本地 SQLite、Cloudflare D1 与 Turso 之间切换。', driver: '当前驱动', ready: '可用' }, links: { profile: '编辑个人资料', display: '调整显示' } } },
  'settings:zh-TW': { settings: { eyebrow: 'Nova / 設定', title: '讓工作台適合你。', subtitle: '調整偏好、工作階段與資料邊界。', saved: '設定已儲存', tabs: { profile: '個人資料', display: '顯示與語言', security: '安全工作階段', database: '資料庫' }, profile: { title: '個人資料', description: '資料使用信封加密保存；沒有設定金鑰時不會寫入敏感欄位。', name: '稱呼', namePlaceholder: '例如：小 Nova', email: '電子郵件', address: '地址（可選）', addressPlaceholder: '僅在需要時填寫' }, display: { title: '顯示與語言', description: '選擇 Nova 在不同裝置上的呈現方式。', theme: '主題模式', themeHint: '系統模式會跟隨裝置偏好。', language: '語言' }, security: { title: '安全工作階段', description: '登入權杖只攜帶到期時間與隨機數，不保存原始密碼。', defaultDuration: '預設工作階段時長' }, database: { title: '資料庫狀態', description: 'Nova 透過配接器在本地 SQLite、Cloudflare D1 與 Turso 之間切換。', driver: '目前驅動', ready: '可用' }, links: { profile: '編輯個人資料', display: '調整顯示' } } },
  'settings:en': { settings: { eyebrow: 'Nova / Settings', title: 'Make the workspace yours.', subtitle: 'Tune preferences, sessions, and data boundaries.', saved: 'Settings saved', tabs: { profile: 'Profile', display: 'Display & language', security: 'Security', database: 'Database' }, profile: { title: 'Profile', description: 'Profile data is envelope-encrypted; sensitive fields are not written without a key.', name: 'Name', namePlaceholder: 'For example: Nova', email: 'Email', address: 'Address (optional)', addressPlaceholder: 'Only when needed' }, display: { title: 'Display & language', description: 'Choose how Nova should feel across your devices.', theme: 'Theme mode', themeHint: 'System mode follows your device preference.', language: 'Language' }, security: { title: 'Security session', description: 'The login token carries only expiry data and a nonce, never the original password.', defaultDuration: 'Default session duration' }, database: { title: 'Database status', description: 'Nova switches between SQLite, Cloudflare D1, and Turso through adapters.', driver: 'Current driver', ready: 'Available' }, links: { profile: 'Edit profile', display: 'Adjust display' } } },
  'settings/profile:zh-CN': { settingsProfile: { title: '个人资料', description: '资料会使用 AES-GCM 信封加密保存。', name: '称呼', email: '邮箱', phone: '电话', address: '地址', save: '保存资料' } },
  'settings/profile:zh-TW': { settingsProfile: { title: '個人資料', description: '資料會使用 AES-GCM 信封加密保存。', name: '稱呼', email: '電子郵件', phone: '電話', address: '地址', save: '儲存資料' } },
  'settings/profile:en': { settingsProfile: { title: 'Profile', description: 'Profile data is envelope-encrypted with AES-GCM.', name: 'Name', email: 'Email', phone: 'Phone', address: 'Address', save: 'Save profile' } },
  'settings/display:zh-CN': { settingsDisplay: { title: '显示与语言', description: '选择你喜欢的呈现方式。', theme: '主题模式', themeHint: '系统、浅色或深色', language: '语言' } },
  'settings/display:zh-TW': { settingsDisplay: { title: '顯示與語言', description: '選擇你喜歡的呈現方式。', theme: '主題模式', themeHint: '系統、淺色或深色', language: '語言' } },
  'settings/display:en': { settingsDisplay: { title: 'Display & language', description: 'Choose your preferred presentation.', theme: 'Theme mode', themeHint: 'System, light, or dark', language: 'Language' } },
  'settings/security:zh-CN': { settingsSecurity: { title: '安全会话', description: '令牌过期后需要重新输入密码。', notice: '原始密码不会进入后续请求；服务端只校验派生的 HMAC 令牌。', duration: '默认会话时长', save: '保存偏好', options: { '4h': '4 小时', '8h': '8 小时', '12h': '12 小时', '24h': '24 小时', '7d': '7 天', '14d': '14 天', '30d': '30 天', '90d': '90 天', session: '直到浏览器关闭' } } },
  'settings/security:zh-TW': { settingsSecurity: { title: '安全工作階段', description: '權杖到期後需要重新輸入密碼。', notice: '原始密碼不會進入後續請求；服務端只校驗派生的 HMAC 權杖。', duration: '預設工作階段時長', save: '儲存偏好', options: { '4h': '4 小時', '8h': '8 小時', '12h': '12 小時', '24h': '24 小時', '7d': '7 天', '14d': '14 天', '30d': '30 天', '90d': '90 天', session: '直到瀏覽器關閉' } } },
  'settings/security:en': { settingsSecurity: { title: 'Security session', description: 'Enter your password again after the token expires.', notice: 'The original password never enters later requests; the server validates only the derived HMAC token.', duration: 'Default session duration', save: 'Save preference', options: { '4h': '4 hours', '8h': '8 hours', '12h': '12 hours', '24h': '24 hours', '7d': '7 days', '14d': '14 days', '30d': '30 days', '90d': '90 days', session: 'Until browser closes' } } },
  'settings/database:zh-CN': { settingsDatabase: { title: '数据库状态', description: 'SQL-first 适配器保持业务逻辑的平台无关性。', driver: '当前数据库驱动', checking: '检查中', ready: '可用', unavailable: '不可用', info: '迁移版本与设置快照由服务端统一维护。' } },
  'settings/database:zh-TW': { settingsDatabase: { title: '資料庫狀態', description: 'SQL-first 配接器保持業務邏輯的平台無關性。', driver: '目前資料庫驅動', checking: '檢查中', ready: '可用', unavailable: '無法使用', info: '遷移版本與設定快照由服務端統一維護。' } },
  'settings/database:en': { settingsDatabase: { title: 'Database status', description: 'SQL-first adapters keep business logic platform-independent.', driver: 'Current database driver', checking: 'Checking', ready: 'Available', unavailable: 'Unavailable', info: 'Migration version and settings snapshots are maintained by the server.' } },
};

function getNested(object, key) {
  return key.split('.').reduce((value, part) => value?.[part], object);
}

function isFileMode() {
  return globalThis.location?.protocol === 'file:';
}

export class I18n extends EventTarget {
  #language;
  #bundles = new Map();
  #moduleBundles = new Map();
  #moduleNamespaces = new Set();

  constructor(language = 'zh-CN') {
    super();
    this.#language = SUPPORTED_LANGUAGES.includes(language) ? language : 'zh-CN';
  }

  get language() { return this.#language; }

  async init() {
    await this.#loadBundle(this.#language);
    if (globalThis.document) document.documentElement.lang = this.#language;
    return this;
  }

  async setLanguage(language) {
    if (!SUPPORTED_LANGUAGES.includes(language)) return;
    await this.#loadBundle(language);
    this.#language = language;
    await Promise.all([...this.#moduleNamespaces].map((namespace) => this.loadModule(namespace)));
    if (globalThis.document) document.documentElement.lang = language;
    this.dispatchEvent(new CustomEvent('language-change', { detail: { language } }));
  }

  async loadModule(namespace) {
    this.#moduleNamespaces.add(namespace);
    const key = `${namespace}:${this.#language}`;
    if (this.#moduleBundles.has(key)) return this.#moduleBundles.get(key);
    if (isFileMode()) {
      const bundle = FALLBACK_MODULE_BUNDLES[key] || {};
      this.#moduleBundles.set(key, bundle);
      return bundle;
    }
    try {
      const [moduleId, ...submoduleParts] = namespace.split('/');
      const modulePath = submoduleParts.length
        ? [moduleId, 'submodules', ...submoduleParts].join('/')
        : moduleId;
      const response = await fetch(`/app/modules/${modulePath}/locales/${this.#language}.json`);
      if (!response.ok) throw new Error(`无法加载模块语言包 ${namespace}`);
      const bundle = await response.json();
      this.#moduleBundles.set(key, bundle);
      return bundle;
    } catch {
      const bundle = FALLBACK_MODULE_BUNDLES[key] || {};
      this.#moduleBundles.set(key, bundle);
      return bundle;
    }
  }

  t(key, fallback = key, values = {}) {
    let value = getNested(this.#bundles.get(this.#language) || {}, key);
    if (value === undefined) {
      for (const [bundleKey, bundle] of this.#moduleBundles.entries()) {
        if (!bundleKey.endsWith(`:${this.#language}`)) continue;
        value = getNested(bundle, key);
        if (value !== undefined) break;
      }
    }
    if (typeof value !== 'string') value = fallback;
    return Object.entries(values).reduce((result, [name, replacement]) => result.replaceAll(`{{${name}}}`, String(replacement)), value);
  }

  async #loadBundle(language) {
    if (this.#bundles.has(language)) return;
    if (isFileMode()) {
      this.#bundles.set(language, FALLBACK_BUNDLES[language] || FALLBACK_BUNDLES['zh-CN']);
      return;
    }
    try {
      const response = await fetch(`/app/locales/${language}.json`);
      if (!response.ok) throw new Error(`无法加载语言包 ${language}`);
      this.#bundles.set(language, await response.json());
    } catch {
      this.#bundles.set(language, FALLBACK_BUNDLES[language] || FALLBACK_BUNDLES['zh-CN']);
    }
  }
}

export { FALLBACK_BUNDLES, FALLBACK_MODULE_BUNDLES, SUPPORTED_LANGUAGES };
