# ByteFix — catálogo estático com Supabase

Site de assistência técnica e catálogo de peças em HTML/CSS/JS, sem framework e sem build.

## Estrutura
- `index.html`: página pública
- `admin.html`: login e painel de gestão
- `css/style.css`: estilos responsivos
- `js/config.js`: URL e anon key Supabase (configuração pública)
- `js/site.js`: catálogo, filtros, serviços e dados institucionais
- `js/admin.js`: gestão autenticada e upload
- `supabase/schema.sql`: tabelas e policies de exemplo
- `assets/dono.jpg`: adicione aqui a foto do proprietário

## Configurar Supabase
1. Crie um projeto no https://supabase.com/.
2. Em Authentication > Users, crie o usuário do proprietário (e-mail e senha). Desative signups públicos em Authentication > Settings, se não precisar de cadastro de usuários.
3. Copie o UUID do usuário criado.
4. Em SQL Editor, execute `supabase/schema.sql`, substituindo todas as ocorrências de `UUID_DO_DONO` pelo UUID real do proprietário. As policies do script dão leitura pública e escrita apenas ao UUID indicado.
5. Em Settings > API, copie Project URL e anon/public key. Preencha `js/config.js`.
6. O script cria o bucket Storage `catalogo` como público e policies de leitura pública e upload/alteração/exclusão restritos ao UUID do proprietário. Se o script falhar por policy já existente, confira Storage > Policies e crie as policies correspondentes (não deixe upload público).
7. Confirme que as tabelas estão no schema public e disponíveis via API (Database > Tables / API settings).

**Segurança:** jamais use service_role key no browser. A URL e anon key são públicas; segurança depende das policies RLS. O painel é uma interface, não uma barreira de segurança: as policies do banco e Storage são a proteção real. O código não implementa remoção de arquivos de imagem antigos quando substitui a imagem do registro.

## Personalizar
Edite `STORE` em `js/site.js`: nome, número WhatsApp (formato internacional sem `+` ou espaços; Brasil = 55 + DDD + número), história, nome do dono, endereço, horários e link Google Maps. Ajuste as categorias conforme seus produtos. A foto é `assets/dono.jpg`.

## Deploy Vercel
1. Suba a pasta para um repositório Git (GitHub/GitLab/Bitbucket).
2. Na Vercel, Add New Project e importe o repositório.
3. Framework Preset: Other. Build Command e Output Directory ficam vazios (ou output `.`); não há etapa de build.
4. Deploy. `vercel.json` incluído para URLs estáticas.
5. Teste o site e a área `/admin.html`; configure também URL de redirect do Auth no Supabase se futuramente usar e-mail links.

## Observações
- A imagem dos produtos deve ser adicionada pelo painel; URLs são armazenadas no campo `imagem`.
- Catálogo usa filtros combinados de texto, categoria, marca e preço.
- Erros de fetch e estados de carregamento são exibidos.
- Exemplo de categorias inicial: Monitores, Periféricos, Gabinetes, Componentes e Outros.
