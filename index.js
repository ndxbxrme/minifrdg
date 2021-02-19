const Minifrdg = (rootSelector) => {
  const base = {name:''};
  const useHash = /\.html/.test(document.baseURI);
  const templates = {};
  const controllers = {};
  const callbacks = {};
  let hooks = {};
  const components = [];
  const text = document.createElement('div');
  const $ = (selector, elem) => (elem || document).querySelector(selector);
  const $$ = (selector, elem) => Array.from((elem || document).querySelectorAll(selector));
  const fill = (template, ctrl) => (/&.+?;/.test(template) && (text.innerHTML = template) && text.innerText || template).replace(/\{\{(.+?)\}\}/g, (all, str) => (new Function("with(this) {return " + str + "}")).call(ctrl));
  const on = (eventName, cb) => (callbacks[eventName] = callbacks[eventName] || []).push(cb);
  const fireCallbacks = async (eventName, data) => (await (callbacks[eventName] || []).reduce(((p,fn) => p.then((res) => fn(res))), Promise.resolve(data)));
  const inflate = (name, data) => fill(template = templates[name] || '', (hooks[app.route] = data || controllers[name] && controllers[name](app) || {}));
  const refresh = () => {
    [rootSelector || 'app', ...components].forEach((component) => ($(component) || {}).innerHTML = inflate(component===(rootSelector || 'app') && app.route || component, hooks[app.route]));
    $$('a').forEach(anchor => anchor.href && !anchor.target && (anchor.onclick = () => {app.goto(anchor.href.replace(document.location.origin,''));return false}));
  }
  const setState = async () => {
    (await fireCallbacks('cleanup') || (delete callbacks.cleanup)) && (hooks = {});
    [route, ...app.params] = (useHash && window.location.hash.replace('#', '').replace(/^\//, '') || window.location.pathname.replace(/^\//, '')).replace(base.name, '').split(/\//g);
    app.route = templates[route] && route || 'dashboard';
    try {await fireCallbacks('routeChange')} catch(e) {return}
    refresh();
  };
  const goto = (route) => {
    if(useHash) document.location.hash = route;
    else {
      route = document.location.origin + '/' + route.replace(/^\//, '');
      route !== document.location.pathname && window.history.pushState(route, null, route);
    }
    setState();
  };
  const loadLocalTemplates = () => $$('script[type="text/template"]').reduce((res, template) => (res[template.id] = template.innerText) && res, app.templates);
  const app = {base,useHash,templates,controllers,callbacks,components,$,$$,fill,on,fireCallbacks,setState,goto,refresh,loadLocalTemplates,start: () => setState(),fns:{},vars:{}};
  return app;
}
(typeof(module)!=='undefined') && (module.exports = Minifrdg) || (window.Minifrdg = Minifrdg)