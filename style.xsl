<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html" omit-xml-declaration="yes"/>
<xsl:template match="/">
<html><head><title>EXTXSL</title></head>
<body><h1 id="r">EXT_XSL_OK</h1>
<script>document.getElementById('r').textContent='EXT_XSL_OK '+document.domain+' '+location.origin;</script>
</body></html>
</xsl:template></xsl:stylesheet>