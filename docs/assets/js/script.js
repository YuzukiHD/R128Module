document.write(unescape("%3Cspan id='cnzz_stat_icon_1279842187'%3E%3C/span%3E%3Cscript src='https://s9.cnzz.com/z_stat.php%3Fid%3D1279842187' type='text/javascript'%3E%3C/script%3E"));


$(function() {

  $('main div.md-content img').each(function() {
    $this = $(this);
    if ($this.parent('a').length > 0) {
      return;
    }
  
    $this.wrap('<a class="simpleLightbox" href="'+ $this.attr('src') +'"></a>');
  });

  $('a.simpleLightbox').simpleLightbox();

});
