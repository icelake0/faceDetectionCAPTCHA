function copyAPIKey() {
  const el = document.createElement('textarea');
  el.value = document.getElementById('apiKey').innerHTML;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}