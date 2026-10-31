Guia de Migração e Checklist de Diagnóstico: Padronização Gold da Estação Claude Code em VPS
1. Diagnóstico e Preparação da Infraestrutura de Base (Linux & Runtimes)
A implantação de ambientes de execução de agentes em VPS exige o isolamento estrito do ciclo de vida dos processos e a contenção do  blast radius  de memória. Antes de orquestrar frameworks de agentes autônomos e disparar rotinas de inferência em grande escala, é imperativo garantir a estabilidade térmica do sistema operacional subjacente e a disponibilidade de runtimes modernos. A escassez de recursos de hardware sem contenção determinística resulta no encerramento abrupto de processos pelo kernel do Linux por estouro de memória ( Out-Of-Memory/OOM Killer ), corrompendo instâncias ativas do Claude Code e destruindo a persistência do estado da sessão.
1.1 Configuração e Ativação de Memória Swap (2GB)
Em instâncias de VPS com limitação de memória RAM física, picos de consumo decorrentes da análise sintática de codebases extensas, indexação de vetores ou compilação de dependências podem sobrecarregar a memória primária. A alocação de um arquivo de  Swap  de 2GB atua como uma barreira de proteção indispensável contra falhas catastróficas de OOM.
Para provisionar o arquivo, aplicar permissões POSIX estritas e configurar a montagem permanente no fstab, execute o bloco de comandos abaixo:
# Criar o arquivo de Swap com o tamanho exato de 2GB
sudo fallocate -l 2G /swapfile


# Restringir permissões de leitura e escrita exclusivamente ao usuário root (segurança de kernel)
sudo chmod 600 /swapfile


# Estruturar o arquivo como área de troca do sistema
sudo mkswap /swapfile


# Ativar imediatamente o espaço de Swap no subsistema de memória
sudo swapon /swapfile


# Persistir a configuração na inicialização do sistema via /etc/fstab
echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab


1.2 Elevação de Runtimes: Node.js v22/v24 e Python 3.12
O ecossistema Claude Code e suas ferramentas de suporte exigem versões específicas dos executáveis base. O Claude Code necessita da versão  Node.js v22 LTS (v22.20+)  para a execução eficiente de scripts assíncronos e módulos ECMAScript modernos. Todavia, ecossistemas de orquestração de subagentes como o  Paperclip  demandam estritamente o  Node.js v24+ . Para suportar ambas as necessidades sem conflito no ambiente do sistema operacional, recomenda-se o gerenciamento de runtimes via nvm ou a definição do Node.js v24 como padrão do sistema.
Simultaneamente, as habilidades de análise de dados, parsing e servidores MCP exigem o  Python 3.12+ . Execute o procedimento de atualização do sistema e alocação de runtimes:
# Atualização dos repositórios e pacotes do sistema
sudo apt update && sudo apt upgrade -y


# Instalação do Node.js v24 LTS (garantindo compatibilidade nativa com Claude Code e Paperclip)
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs


# Validação da versão do Node.js (deve retornar v24.x.x)
node -v


# Instalação e atualização para Python 3.12 e ambiente virtual
sudo apt install -y python3.12 python3.12-venv python3-pip


# Configuração de alternativas para apontar o comando python3 diretamente para o Python 3.12
sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.12 1


# Validação do Python 3.12
python3.12 --version


1.3 Instalação de Utilitários e CLIs Essenciais (gh, uv, ffmpeg)
A indisponibilidade de ferramentas de linha de comando no PATH do sistema gera falhas em rotinas autônomas. A ausência do  gh  paralisa fluxos de trabalho que dependem de abertura de Pull Requests, auditoria de código e versionamento remoto. A falta do  uv  penaliza o tempo de execução de ferramentas Python, substituindo builds em milissegundos por instalações lentas via pip convencional. Por fim, a ausência do  ffmpeg  colapsa pipelines multimodais de áudio e vídeo, impedindo a extração de frames e a pré-digestão de mídias pelo agente.
A tabela abaixo sumariza as ferramentas essenciais e suas formas de instalação limpa:
Ferramenta CLI,Propósito no Ecossistema,Comando Primário de Instalação
gh  (GitHub CLI),"Autenticação, gestão de repositórios, versionamento e automação de commits/PRs pelo agente.",Ver bloco de código abaixo
uv,Gerenciamento e instalação ultrarrápida de pacotes e ambientes virtuais Python.,curl -sSf https://astral.sh/uv/install.sh \| sh
ffmpeg,"Manipulação, conversão e extração de mídias para processamento multimodal.",sudo apt install -y ffmpeg
Para evitar erros de sintaxe de terminal decorrentes de  pipes  em tabelas Markdown, instale o repositório oficial e a CLI do GitHub utilizando o script isolado a seguir:
# Instalação segura da GitHub CLI (gh)
type -p curl >/dev/null || (sudo apt update && sudo apt install curl -y)
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update && sudo apt install gh -y


Com a infraestrutura de base do sistema operacional Linux estabilizada e os runtimes configurados nas versões corretas, o próximo passo consiste em equipar a estação Claude Code com um repositório padronizado de habilidades locais de produtividade e design.
2. Instalação e Configuração de Skills de Produtividade e Design
No ecossistema Claude Code,  Skills  são unidades modulares de capacidade que estendem a inteligência do agente para tarefas específicas. Em vez de inflar o prompt de sistema inicial — o que desperdiça a janela de contexto útil —, as habilidades organizam instruções, scripts determinísticos e referências para carregamento hierárquico sob demanda. A adoção desse conjunto eleva o desempenho do agente em tarefas de engenharia de software e design de interfaces.
2.1 Metodologia para Projetos Longos: Skill GSD (Get Stuff Done)
Projetos de engenharia de longa duração sofrem com a degradação de contexto conforme o histórico da sessão se expande. A metodologia GSD ( Get Stuff Done ) resolve essa limitação ao impor uma estrutura de planejamento e rastreamento de tarefas através de arquivos contínuos no repositório local.
Para instalar a habilidade GSD globalmente na estação, execute:
npx @opengsd/gsd-core@latest --claude --global


Com o GSD ativo, o agente registra decisões arquiteturais em arquivos locais (como plano.md e estados de tarefas em subdiretórios), prevenindo alucinações de escopo e mantendo a continuidade do desenvolvimento mesmo após a renovação da janela de contexto.
2.2 Polimento de Design e Refinamento de Prompts (impeccable e humanizer)
A padronização visual das saídas do agente exige a eliminação de componentes genéricos (a chamada "cara de IA") e a aplicação de boas práticas de interface de usuário e tom de voz:
* Impeccable Design:  Fornece 24 comandos de auditoria e geração visual para garantir interfaces modernas, acessíveis e alinhadas aos princípios de UI/UX profissional.
* Humanizer:  Refina os prompts e reescreve textos de saída para garantir clareza, tom persuasivo e linguagem natural, eliminando clichês de geração artificial.
Comandos para instalação e registro:
# Instalação da skill de design e interface Impeccable
npx impeccable install


# Instalação da skill Humanizer via marketplace oficial do Claude Code
/plugin marketplace add blader/humanizer


2.3 Mapeamento Dinâmico com find-skills
Para evitar que o desenvolvedor precise memorizar a localização e a sintaxe de dezenas de habilidades, a ferramenta find-skills habilita a busca pragmática no ecossistema. O Claude Code analisa o objetivo da instrução atual e localiza dinamicamente novas extensões disponíveis.
Instale a habilidade find-skills via terminal:
npx skills add vercel-labs/skills --skill find-skills


2.4 Matriz Consolidada de Skills
Sumarizam-se a seguir as habilidades recomendadas para a Estação Gold do Claude Code:
Nome da Skill,Origem / Pacote,Função Principal,Comando Exato de Ativação
GSD,@opengsd/gsd-core,Divisão estruturada de projetos de longo prazo e retenção de contexto.,npx @opengsd/gsd-core@latest --claude --global
Impeccable,impeccable,Revisão visual de UI/UX e aplicação de design profissional.,npx impeccable install
Humanizer,blader/humanizer,"Otimização de tom de voz, remoção de clichês de IA e refinamento de prompts.",/plugin marketplace add blader/humanizer
Find-Skills,vercel-labs/skills,Mapeamento e descoberta dinâmica de habilidades sob demanda.,npx skills add vercel-labs/skills --skill find-skills
Além de equipar a estação com habilidades locais de execução, o agente exige conectividade direta com serviços externos de dados e navegação por meio do protocolo padronizado MCP.
3. Integração e Autenticação de Protocolos MCP (Model Context Protocol)
O Model Context Protocol (MCP) é um padrão aberto mantido sob governança da Linux Foundation que padroniza como aplicações de IA interagem com ferramentas, recursos e prompts expostos por serviços externos ou subprocessos locais. Operando via JSON-RPC 2.0 sobre transporte stdio (processos locais) ou Streamable HTTP (servidores remotos conectados via HTTP/SSE), os servidores MCP transformam a VPS em uma plataforma capaz de integrar APIs de terceiros de forma segura.
+-----------------------------------------------------------------------+
|                              Claude Code                              |
|                            (Cliente MCP)                              |
+-----------------------------------------------------------------------+
                                   |
                  JSON-RPC 2.0 via stdio / Streamable HTTP
                                   |
         +-------------------------+-------------------------+
         |                         |                         |
+-----------------+       +-----------------+       +-----------------+
|  Perplexity MCP |       |    Apify MCP    |       | Playwright MCP  |
|  (Pesquisa Web) |       | Scrape & Coleta |       | Navegação Headless|
+-----------------+       +-----------------+       +-----------------+


3.1 MCPs de Pesquisa e Extração Web (Perplexity e Apify)
A consulta web em tempo real e a extração estruturada de dados permitem ao agente realizar pesquisas técnicas atualizadas e raspagens complexas:
* Perplexity MCP:  Fornece motor de busca em tempo real com citação de fontes primárias.
* Apify MCP:  Permite execução de  scrapers  em lote, extração de dados em diretórios e automação de raspagem web.
Sintaxe de integração no Claude Code:
# Adicionar servidor Perplexity via transporte stdio
claude mcp add perplexity --env PERPLEXITY_API_KEY="SUA_CHAVE_AQUI" -- npx -y @perplexity-ai/mcp-server


# Adicionar servidor Apify via transporte HTTP
claude mcp add --transport http apify https://mcp.apify.com


3.2 MCP de Automação e Navegação Web (Playwright)
O servidor MCP do Playwright permite que o Claude Code interaja com um navegador  headless  executado na própria VPS. Isso capacita o agente a realizar testes automatizados de ponta a ponta, inspecionar o  Document Object Model  (DOM), simular cliques e capturar capturas de tela para diagnose de interface.
Comando de adição:
claude mcp add playwright npx @playwright/mcp@latest


3.3 MCP de Mídia e Síntese Vocal (ElevenLabs)
A integração com o ecossistema da ElevenLabs estende as capacidades do agente para geração e pré-processamento de mídias de áudio diretamente via terminal.
Comando de adição:
claude mcp add --transport http elevenlabs https://api.elevenlabs.io/v1/mcp


3.4 Guia de Autenticação, Gestão de Variáveis e Segurança MCP
Adicionar credenciais brutas em arquivos de perfil global como o ~/.bashrc expõe as chaves de API a todos os subprocessos e scripts de terceiros executados no sistema. No padrão de arquitetura segura, as chaves de API do Claude Code e dos servidores MCP devem ser mantidas em arquivos de ambiente de escopo restrito (chmod 600), carregados especificamente durante a inicialização do agente, ou gerenciadas por proxies de credenciais com permissões baseadas em funções (RBAC).
Adicionalmente, os proxies de segurança MCP devem implementar o  Controle de Acesso em Nível de Método (  Method-Level ACLs  ) . Esse controle diferencia requisições de listagem (tools/list ou resources/read) de invocações de execução real (tools/call), impedindo que agentes sem autorização efetuem chamadas destrutivas a serviços externos.
# Exemplo de isolamento de credenciais via arquivo restrito ~/.claude/.env


# 1. Criar arquivo exclusivo para variáveis de ambiente do Claude Code
touch ~/.claude/.env


# 2. Aplicar permissão POSIX 600 (apenas o proprietário pode ler e escrever)
chmod 600 ~/.claude/.env


# 3. Adicionar as chaves de API de forma isolada dentro de ~/.claude/.env
cat << 'EOF' > ~/.claude/.env
PERPLEXITY_API_KEY="sec_perplexity_key_exemplo"
ELEVENLABS_API_KEY="sec_elevenlabs_key_exemplo"
OPENAI_API_KEY="sec_openai_key_exemplo"
EOF


# 4. Iniciar o Claude Code injetando as variáveis estritamente para a sessão ativa:
# env $(cat ~/.claude/.env | xargs) claude


Com o protocolo MCP conectando o agente a serviços externos com segurança, torna-se necessário organizar a estrutura interna de arquivos e contextos locais dentro do servidor.
4. Arquitetura do Repositório Local de Prompts e Progressive Disclosure
A gestão da janela de contexto é o fator determinante para a precisão e a eficiência de custos do agente. O padrão de  Divulgação Progressiva (  Progressive Disclosure  )  organiza as instruções em camadas hierárquicas: o Claude lê resumos leves e sumários no momento inicial, acessando especificações aprofundadas e scripts executáveis estritamente sob demanda.
4.1 Estrutura de Diretórios no Padrão Ideal (~/.claude/skills/)
As habilidades e instruções armazenadas na estação devem seguir a taxonomia padronizada no diretório base do usuário:
~/.claude/skills/
├── [nome-da-skill]/
│   ├── SKILL.md          ← Manifesto (YAML frontmatter + instruções de alto nível)
│   ├── scripts/          ← Ferramentas executáveis determinísticas (Python, JS, Shell)
│   └── references/       ← Documentação detalhada e especificações de API


O manifesto SKILL.md define o contrato da habilidade através do cabeçalho YAML ( frontmatter ):
---
name: backend-database-audit
description: Executa auditorias de esquema e otimização de consultas PostgreSQL no banco local.
activation: on-demand
requires:
  - env: DATABASE_URL
---


# Instruções de Operação da Skill
Ao ser ativado pelo comando `/backend-database-audit`, leia os scripts em `scripts/` e aplique as validações descritas em `references/schema-rules.md`.


4.2 Separação Tripla de Conteúdo (Referência, Tarefa e Execução)
A separação conceitual dos arquivos reduz o consumo desnecessário de tokens:
1. Conteúdo de Referência (  references/  ):  Documentação técnica, manuais de API e guias de estilo. Injetado no contexto apenas se o agente precisar consultar regras específicas durante a execução.
2. Conteúdo de Tarefa (  SKILL.md  ):  Fluxos de trabalho de alto nível e instruções de orquestração. Fornece o contexto sobre  como  agir sem carregar o código bruto da documentação.
3. Ferramentas Executáveis (  scripts/  ):  Código determinístico em Python, Node.js ou Shell. Operações algorítmicas, como ordenação de coleções, parsings de JSON ou transformações de arquivos, devem ser executadas por scripts no ambiente (custo zero de tokens de geração) em vez de serem geradas linha por linha pelo LLM.
4.3 Diretrizes Antipoluição de Contexto Permanente
Para evitar o esgotamento do limite de tokens e a perda de foco do modelo, aplique as seguintes regras de governança:
* Carregamento Hierárquico:  Mantenha os prompts de sistema enxutos. O manifesto SKILL.md deve conter resumos. Detalhes contidos em references/ só devem ser lidos quando acionados pelo usuário ou pelo fluxo da tarefa.
* Isolamento de Tarefas:  Habilidades extensas com múltiplos propósitos devem ser desmembradas em sub-habilidades desacopladas.
* Higienização de Logs de Saída:  Redirecione os retornos de scripts para arquivos de log em disco, permitindo que o agente leia apenas o resultado sumarizado em vez de centenas de linhas de console.
Uma arquitetura local bem organizada exige a implementação de mecanismos estritos de controle, governança financeira e supervisão humana para execuções automatizadas.
5. Governança e Travas HITL (Human-in-the-Loop)
Conceder autonomia total a agentes de IA com acesso de gravação ao shell da VPS introduz riscos operacionais, financeiros e de segurança. A implementação de pontos de aprovação humana ( Human-in-the-Loop  - HITL), isolamento de processos e travas orçamentárias garante a integridade da infraestrutura.
5.1 Teto de Gastos e Limites de Orçamento (Budget Caps)
A execução de laços de agentes ( agent loops ) em tarefas complexas pode gerar alto consumo de chamadas de API. Para conter gastos indesejados, configure travas orçamentárias:
* Limites em Plataformas de Orquestração:  Em gerenciadores de múltiplos agentes como o  Paperclip  (o qual exige runtime Node.js 24+ para execução de seu painel de controle), estabeleça  budget caps  rígidos diretamente na interface de auditoria (Audit > Budgets) antes do início das tarefas.
* Alertas de Limite de Consumo:  Em serviços integrados via MCP, configure alertas de limite de requisições e teto financeiro por chave de API diretamente nos provedores (Anthropic, OpenAI, Perplexity).
5.2 Pontos de Aprovação Humana (HITL) para Operações Críticas
Ações que possuem alto impacto ou irreversibilidade devem pausar a execução e aguardar a confirmação explícita do desenvolvedor no terminal:
* Operações em Bancos de Dados:  Execução de migrações, alterações de esquemas, exclusões em lote (DELETE, DROP) e edições diretas em tabelas.
* Comunicação e Publicação:  Disparo massivo de e-mails, atualizações em mídias sociais ou modificação de arquivos em repositórios remotos principais.
* Operações Financeiras ou de Nuvem:  Ativação de novos recursos pagos em provedores de nuvem e alteração de planos de serviço.
Diretriz de Governança HITL:  Toda rotina autônoma com potencial destrutivo ou financeiro deve conter a seguinte instrução no seu prompt de execução:  "Interrompa a execução e apresente uma prévia clara das alterações solicitadas. Mantenha o processo pausado no terminal até que a aprovação item por item seja concedida pelo usuário."
5.3 Isolamento, Proxy de Credenciais e Supervisão de Processos (DevOps)
Para evitar que scripts maliciosos ou injeções de prompt no agente acessem credenciais privadas do servidor, aplique a arquitetura de proxy e isolamento:
[ Agente Claude Code ] ---> ( Proxy / Token Escopado ) ---> [ Recurso Protegido / API Externa ]
                                    |
                    (Leitura direta de .env proibida para scripts)


* Bloqueio de Leitura Direta:  Terceiros e scripts contidos em habilidades não devem possuir permissão para ler arquivos .env globais do sistema.
* Supervisão de Processos com  systemd  :  Servidores MCP remotos (HTTP/SSE) e daemons de orquestração como o Paperclip devem ser gerenciados como serviços pelo systemd da VPS, garantindo reinicializações automáticas, logs centralizados via journalctl e limites de consumo de memória.
Exemplo de arquivo de serviço systemd para monitorar um servidor MCP HTTP em plano de fundo (/etc/systemd/system/mcp-server.service):
[Unit]
Description=Servidor MCP HTTP em Plano de Fundo
After=network.target


[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/mcp-server
ExecStart=/usr/bin/node /home/ubuntu/mcp-server/index.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
EnvironmentFile=/home/ubuntu/.claude/.env


# Contenção de recursos via cgroups
MemoryMax=1G
CPUWeight=50


[Install]
WantedBy=multi-user.target


Ative e inicialize o serviço com os comandos:
sudo systemctl daemon-reload
sudo systemctl enable mcp-server
sudo systemctl start mcp-server


Com as regras de governança e isolamento devidamente estabelecidas, o administrador do sistema deve realizar o diagnóstico final de conformidade para validar a prontidão do ambiente.
6. Checklist Matriz de Migração para o Padrão Gold
Após finalizar as etapas de infraestrutura, runtimes, habilidades, conectores MCP e travas de governança, utilize este checklist de auditoria para validar a conformidade da VPS com o  Padrão Gold .
6.1 Tabela de Verificação de Prontidão (Matriz de Conformidade)
Categoria,Componente / Requisito,Comando de Teste / Validação,Status Esperado
1. Infraestrutura,Memória Swap (2GB),free -h \| grep -i swap,Arquivo /swapfile de 2GB listado e ativo.
2. Runtime,Node.js v22+ / v24+,node -v,Versão igual ou superior a v22.20.0 (v24+ para Paperclip).
3. Runtime,Python 3.12+,python3.12 --version,Validação estrita confirmando a versão Python 3.12.x.
4. Utilitários CLI,"CLIs do Sistema (gh, uv, ffmpeg)",gh --version && uv --version && ffmpeg -version,Todos os utilitários instalados e executáveis no PATH.
5. Skills Locais,"Skills Padrão (GSD, impeccable, humanizer, find-skills)",ls -la ~/.claude/skills/,Diretórios das habilidades mapeados e registrados.
6. MCP Integrados,"Conectores MCP (Perplexity, Apify, Playwright, ElevenLabs)",claude mcp list,Servidores MCP listados com status de conexão ativo.
7. Estrutura local,Divulgação Progressiva,ls ~/.claude/skills/skill-name/,"Presença da taxonomia: SKILL.md, scripts/ e references/."
8. Governança,Gestão de Processos e HITL,systemctl is-active mcp-server,Serviço systemd ativo e travas HITL configuradas nos prompts.
6.2 Comando Final de Diagnóstico
Para homologar a estação de trabalho em um único passo no terminal da VPS, execute a sequência de validação:
echo "=== DIAGNÓSTICO DA ESTAÇÃO CLAUDE CODE ===" && \
echo -n "[SWAP]: " && free -h | grep -i swap && \
echo -n "[NODE]: " && node -v && \
echo -n "[PYTHON 3.12]: " && python3.12 --version && \
echo -n "[GH CLI]: " && gh --version | head -n 1 && \
echo -n "[UV CLI]: " && uv --version && \
echo -n "[FFMPEG]: " && ffmpeg -version | head -n 1 && \
echo "[SKILLS INSTALADAS]:" && (ls -1 ~/.claude/skills/ 2>/dev/null || echo "Diretório de skills não encontrado.") && \
echo "[MCP LIST]:" && claude mcp list && \
echo "=== AMBIENTE PRONTO PARA PRODUÇÃO ==="