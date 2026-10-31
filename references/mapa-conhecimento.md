# 🗺️ CLAUDE.md — Mapa Definitivo de Conhecimento: Claude, IA e Automações

> **Visão Geral:** Este arquivo consolida a base de conhecimento estruturada sobre o ecossistema Claude, o Protocolo MCP (Model Context Protocol), Arquitetura de Agentes, Plugins, Skills e Automações [1, 16, 21].

---

## 📐 1. Arquitetura do Claude & Modos de Operação

### 1.1 Plataformas e Interfaces
* **Claude Web / App (Pro, Max, Team, Enterprise):** Interface conversacional com suporte a Projetos, Conectores personalizados e criação de Artefatos [18, 21].
* **Integração Microsoft 365 (Excel e PowerPoint):**
  * **Requisitos:** Plano pago do Claude (Pro/Max/Team/Enterprise) e assinatura Microsoft 365 [2].
  * **Limitações:** O Claude não executa macros, VBA, tabelas de hipóteses (What-If) ou lê arquivos fechados diretamente no Excel [2].
  * **Ativação:** Instalação via Microsoft AppSource ("Claude for Microsoft 365"), login e habilitação do recurso *"Let Claude work across files"* [2].

### 1.2 Claude Code (CLI & Remote Sandboxes)
* **Instalação no Linux/macOS:** `curl -fsSL https://claude.ai/install.sh | bash` (requer Node.js v22+) [5, 25].
* **Mods do Claude Code:** Recursos que estendem o terminal (painéis laterais, comandos de barra, alternância de modelos e sessões conectadas na mesma pasta) [30].
* **Gestão Otimizada de Recursos & Economia:**
  * **Modo Economia (`/barato`):** Roteia tarefas simples de rascunho e limpeza para o modelo **Claude Haiku**, preservando tokens do modelo principal [30].
  * **Trava de Cache de Contexto:** Bloqueio automático de troca de modelo em conversas que ultrapassam 20.000 tokens [30].
* **Divulgação Progressiva (*Progressive Disclosure*):**
  * Padrão de arquitetura em 3 etapas para não estourar a janela de contexto (*context window budget*):
    1. *Índice Leve:* Carregamento apenas dos nomes e descrições das skills [262].
    2. *Expansão sob Demanda:* Leitura do arquivo `SKILL.md` específico quando a tarefa é acionada [262].
    3. *Recursos Associados:* Injeção seletiva de scripts, referências ou templates da pasta [262, 263].

---

## 🔌 2. Model Context Protocol (MCP) — O Padrão Universal de Integração

### 2.1 Conceito, Origem e Evolução
* **Origem:** Lançado pela Anthropic em novembro de 2024 e doado em dezembro de 2025 à *Agentic AI Foundation* (sob guarda da Linux Foundation) [180, 182, 251].
* **O Problema Solvido ($N \times M \to N + M$):** Elimina a necessidade de conexões customizadas e pontuais entre cada modelo e cada ferramenta, padronizando a comunicação via JSON-RPC 2.0 [181, 184, 278].
* **Adoção Global:** Adotado por OpenAI, Google DeepMind, Microsoft, Cursor, Replit e pela maioria dos ambientes de desenvolvimento modernos [180, 185, 251].

### 2.2 Tríade da Arquitetura MCP
1. **MCP Host:** A aplicação principal com o LLM (ex: Claude Desktop, Cursor, Claude Code) que orquestra a sessão do usuário [100, 114, 258].
2. **MCP Client:** O conector 1:1 interno no Host que fala JSON-RPC 2.0 com um servidor específico [100, 183, 258].
3. **MCP Server:** A aplicação remota ou local que expõe as capacidades de um sistema externo (GitHub, Supabase, Postgres, etc.) [100, 113, 258].

### 2.3 Os Três Primitivos Globais do MCP
| Primitivo | Camada de Operação | Controle | Descrição & Método Protocolar | Exemplo |
| :--- | :--- | :--- | :--- | :--- |
| **Tools** | Ação (Escrita) | Modelo / LLM | Funções executáveis que alteram o estado no mundo real. Requer aprovação humana (*Human-in-the-loop*). `tools/list` e `tools/call` [99, 127, 128, 266]. | Criar issue no GitHub, atualizar banco, enviar e-mail [116, 127, 266]. |
| **Resources** | Conhecimento (Leitura) | Aplicação / Host | Dados legíveis sem efeitos colaterais. Identificados por URIs. `resources/list` e `resources/read` [99, 129, 266]. | Esquemas SQL, logs, documentos, arquivos locais [129, 266]. |
| **Prompts** | Fluxo (Workflow) | Usuário Humano | Templates parametrizados para padronizar respostas e comportamentos repetíveis. `prompts/list` e `prompts/get` [99, 130, 266]. | Roteiros de revisão de código, geradores de VSL [116, 130, 266]. |

### 2.4 Transportes e Governança Enterprise
* **Transportes:**
  * `stdio`: Para servidores locais na mesma máquina (ultra-baixa latência via E/S padrão) [98, 117, 258].
  * `Streamable HTTP`: Para servidores remotos em nuvem (evoluído do antigo SSE) [98, 117, 258].
* **Pilares de Infraestrutura:** *Registry* (descoberta/DNS de ferramentas), *Catalog* (organização), *Portal* (consumo self-service/tokens) e *Composer* (montagem de novos MCPs a partir de APIs OpenAPI) [96, 103, 104, 105].
* **Segurança e Defesa:**
  * **AI Gateways (ex: Gravitee MCP Proxy):** Aplicação de controle de acesso por método, limitação de taxa (*throttling*) e autenticação OAuth 2.1 [106, 107, 270, 271].
  * **AgentSecCore:** Motores de inspeção em tempo de execução contendo *PromptScanner*, *CodeScanner*, *PIIChecker* e *SkillLedger* (registro imutável SHA-256 de skills) [269].

---

## 🧩 3. Taxonomia de Sistemas Agentivos & Frameworks

### 3.1 Comparativo de Primitivos de Extensibilidade
* **AI Agent (Agente):** Entidade autônoma primária contendo o loop de raciocínio, memória e planejamento (ReAct, Plan-and-Execute) [253, 254].
* **Plugin:** Pacote estruturado contendo código executável, manifestos (`manifest.json`) e invocações determinísticas via *Function Calling* [253, 254, 259].
* **Skill / Skillware:** Bloco comportamental em linguagem natural persistente (`SKILL.md`), estruturado sob o conceito de ontologia de software (*Skillware Unit*) [198, 204, 253, 255].
* **Resource (Recurso):** Contexto passivo *read-only* fornecido por URI [253, 256].

### 3.2 Frameworks Multiagente (Panorama 2026)
* **Semantic Kernel (Microsoft):** SDK enterprise poliglota (.NET, Java, Python) com suporte nativo a MCP, plugins e governança rigorosa [74, 79, 257].
* **LangGraph:** Orquestração baseada em grafos cíclicos com estado persistente, ideal para automações que exigem autocorreção [74, 76, 257].
* **CrewAI:** Arquitetura focada em equipes baseadas em papéis (*roles*), metas e processos sequenciais/hierárquicos [74, 77, 257].
* **AutoGen (Microsoft Research):** Framework assíncrono orientado a mensagens de eventos entre agentes conversacionais [74, 78, 257].
* **LlamaIndex:** Framework orientado a fluxos de eventos focado em RAG e grounding sobre grandes volumes de dados [74, 80].

---

## ⚡ 4. Catálogo Mestre de Complementos, Plugins e Skills

### 🛠️ Departamento 1: Construir, Testar e Orquestrar
1. **Superpowers (`superpowers@claude-plugins-official`):** Fachada de inicialização e gestão guiada de fluxos de trabalho [5, 223].
2. **gstack:** Script e ferramentas para orquestração local [5].
3. **graphify:** Mapeamento de conhecimento do projeto em grafos [5, 34].
4. **GitHub CLI (`gh`):** Gestão de repositórios e branches via terminal [5].
5. **Vercel (`vercel@claude-plugins-official`):** Mapeia 37 skills para compilação e deploy direto [5, 25].
6. **Playwright MCP:** Automação de navegadores, testes e capturas de tela [5, 35].
7. **OpenAI Codex Plugin (`codex@openai-codex`):** Correção, revisão e salvamento de código em segundo plano [5, 31].
8. **Claude HUD:** Painel lateral de status e métricas [5].
9. **GSD (Get Stuff Done):** Metodologia para projetos longos contendo 67 skills e 33 agentes especialistas [34].

### 🎨 Departamento 2: Design, UI/UX e Frontend
1. **Figma MCP:** Conector oficial para leitura de designs e conversão em código [6, 35].
2. **UI UX Pro Max (`ui-ux-pro-max-skill`):** Diretrizes de design avançadas para eliminar "cara de IA" [6].
3. **Impeccable (`npx impeccable install`):** 24 comandos de refino e revisão visual de interfaces [6, 34, 35].
4. **Taste Skill:** Design de arte e refinamento estético [6, 35].
5. **emil-design-eng:** Animações e componentes visuais fluidos [6, 35].
6. **HyperFrames:** Gerador de vídeos HTML e MP4 a partir de texto [6, 32].
7. **Remotion:** Animações em código React [6].
8. **ffmpeg:** Processamento e manipulação de vídeo e áudio via CLI [6].
9. **Higgsfield MCP:** Animações e ad creatives via IA generativa [4, 6].

### 🔍 Departamento 3: Pesquisa, Scraping e Inteligência
1. **Perplexity MCP:** Buscas em tempo real com citação de fontes [7].
2. **Claude in Chrome:** Extensão oficial de navegação e leitura web [7].
3. **Firecrawl MCP:** Scraping limpo de páginas web convertidas em Markdown [7].
4. **Apify MCP:** Coleta de dados, extração de redes sociais e e-commerce [7, 36].
5. **last30days:** Pesquisa de menções, tendências e tópicos recentes na web [7, 35].
6. **Gemini CLI:** Integração com os modelos Gemini da Google [7].
7. **Humanizer:** Refinamento de tom para remover escrita sintética de IA [7, 32].
8. **Metricool MCP:** Análise de métricas de redes sociais [7].

### 📦 Departamento 4: Mídia, Áudio e Produtividade Operacional
1. **ElevenLabs MCP:** Síntese de voz hiper-realista e locução [8].
2. **Notion MCP:** Gestão de páginas, bancos de dados e tarefas [8, 36].
3. **Zapier MCP:** Conexão com milhares de aplicativos e automações [8].
4. **Caveman:** Gestão simplificada de contexto [8].
5. **find-skills:** Descoberta e instalação dinâmica de novas skills [8].
6. **Ollama:** Execução de modelos de IA locais no computador [8].

### 📈 Departamento 5: Gestão de Tráfego de Anúncios
* **Conexão MCP:** Servidor MCP de anúncios configurado no Claude Web ou Claude Code [9].
* **Capacidades:** Extração de relatórios de desempenho (ROAS, CTR, CPC), criação de rascunhos de campanhas (tudo nasce pausado por segurança), gestão de públicos e pixel [9].
* **Travas de Segurança:** Configuração obrigatória de tetos orçamentários e permissões [9].

---

## 💼 5. Modelos de Negócios e Vendas de Serviços com IA

### 5.1 Os 5 Modelos de Agência de IA
1. **Agência de Geração de Leads B2B:** Pesquisa, qualificação e mensagens personalizadas [26].
2. **Agência de Recepcionistas com IA:** Atendimento via WhatsApp/Webchat e agendamento para clínicas/comércios [26].
3. **Máquina de Conteúdo com IA:** Transformação de vídeos longos/podcasts em cortes, Reels e carrosséis [26].
4. **Automação Administrativa:** Triagem documental, entrada de pedidos e relatórios financeiros [26].
5. **Automação de Processos Ponta a Ponta:** Integração de sistemas legados com regras de negócio e fallback humano [26].

### 5.2 7 Repositórios Open Source Monetizáveis
1. **CRM (`trycompai/crm`):** CRM com pesquisa automática de contatos via agentes [10].
2. **OpenSEO (`every-app/open-seo`):** Auditoria e otimização de SEO [10, 32].
3. **Monitoramento (`dgtlmoon/changedetection.io`):** Monitoramento de alterações em sites de concorrentes e preços.
4. **Reconstrução de Sites (`JCodesMore/ai-website-cloner-template`):** Reconstrução de sites antigos em código moderno [11].
5. **Relatórios PPT (`hugohe3/ppt-master`):** Leitura de planilhas e geração automática de apresentações [11].
6. **Scraper (`D4Vinci/Scrapling`):** Extração de listas de prospecção B2B [12].
7. **OCR (`PaddlePaddle/PaddleOCR`):** Leitura automática de notas fiscais e contratos [12].

---

## 🔄 6. Automações e Criação de Mídia (n8n, WanGP, YouTube)

### 6.1 Automações de Rotina com n8n
* **Templates de Produção:** Recepcionista de IA, Gerador de Leads B2B, Clonador de Anúncios, Automação de Vídeos sem aparecer, Agente de Conteúdo Multicanal, Suporte Multilíngue por e-mail [38].
* **Paperclip:** Framework para criar "escritórios de agentes" com hierarquia e limite de gastos [42].

### 6.2 Animação 3D & YouTube
* **Infraestrutura:** Wan2GP (local com 12GB+ VRAM) ou LTX-2.5 na nuvem (RunPod) [19].
* **Regras do YouTube:** Marcação obrigatória de conteúdo direcionado a crianças, proibição de reprodução em massa de IA (*AI slop*) e obrigatoriedade de declaração de voz/música sintética [19, 20].

---

## 📚 7. Links de Referência Oficial Consolidados

* **Documentação Oficial Claude Code:** Documentação e guias de instalação oficiais da Anthropic [21, 45].
* **Especificação Agent Skills:** Especificações técnicas do padrão Agent Skills e Skillware [201, 316].
* **Especificação Model Context Protocol:** Especificação oficial do protocolo MCP e JSON-RPC 2.0 [190, 235].
* **Awesome Copilot Agent Skills:** Diretório de habilidades e agentes para desenvolvimento e automação [264, 316].
* **Repositório de Mods do Claude Code:** Playground de plugins e customizações oficiais da Anthropic [45].
