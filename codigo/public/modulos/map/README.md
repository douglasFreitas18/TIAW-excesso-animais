# ZooPet – Mapeamento de Zoonoses

## Como rodar
1. Abra um terminal nesta pasta e suba a API fake com JSON Server:
   ```bash
   npx json-server --watch db.json --port 3000
   # ou, se tiver instalado global:
   json-server --watch db.json --port 3000
   ```

2. Sirva os arquivos estáticos (recomendado para evitar bloqueios do navegador):
   ```bash
   # opção Python
   python -m http.server 5500
   # opção Node
   npx serve .
   ```

3. Acesse no navegador:
   - Se usar Python: http://localhost:5500/index.html
   - Se usar `serve`: ele mostrará a URL; abra `index.html`.

Pronto! O mapa carrega os dados de `http://localhost:3000/instituicoes`.
