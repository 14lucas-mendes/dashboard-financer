# Dashboard Financer

Aplicação web de controle financeiro pessoal com foco em visualização mensal de transações, resumo financeiro e evolução incremental de arquitetura MVC.

## Visão geral do projeto

O projeto foi estruturado em MVC:

- **Model**: regras de negócio e persistência (`Wallet`, `Transaction`)
- **Controller**: orquestração do fluxo da aplicação e preparação de dados para a UI
- **View**: renderização da interface (cards, tabela, header)

Atualmente a aplicação permite:

- Criar, editar e remover transações
- Persistir transações em `localStorage`
- Navegar por mês/ano no header (`prev`/`next`)
- Filtrar transações por período selecionado
- Atualizar cards e tabela com base no mesmo conjunto filtrado
- Formatar valores monetários em `pt-BR` / `BRL` para cards e tabela
- Validar submissão do formulário e prevenir criação de transações inválidas

---

## O que já foi implementado

### 1) Navegação de período no header

- Estado de período mensal no model (`Wallet.date`)
- Avanço/recuo de mês com ajuste de dia para evitar efeitos colaterais de calendário
- Suporte à virada de ano (dezembro ↔ janeiro)
- Header atualizado via fluxo de renderização

### 2) Renderização unificada por período

- Centralização da atualização de UI no método `render()` do controller
- Fluxo unificado para `add`, `update`, `remove`, `moveNext`, `movePrevious`
- Evita divergência entre estado interno e tela

### 3) Filtro mensal robusto

- Validação de existência e tipo da data da transação
- Validação estrutural do formato de data esperado
- Conversão e validação numérica de mês/ano
- Filtro por mês/ano selecionados no estado do `Wallet`

### 4) Consistência entre cards e tabela

- Tabela renderiza transações filtradas do período ativo
- Cards calculam totais com base no mesmo array filtrado
- Estado vazio do período zera os cards

### 5) Padronização de moeda

- Formatação centralizada no controller com `Intl.NumberFormat`
- Padrão adotado: `locale = pt-BR` e `currency = BRL`
- Valores exibidos com duas casas decimais no padrão monetário local

### 5.1) Importar / Exportar transações (JSON)

- Exporta um arquivo JSON no formato `wallet-YYYY-MM-DD.json` com metadados e lista de transações
- Importa JSON e faz merge com as transações existentes
- IDs são regenerados no import (cada item importado vira uma nova transação)
- Import parcial: itens inválidos são ignorados e o app exibe um resumo `importadas/ignoradas`

### 6) Textos dinâmicos nos cards

- Card de entradas exibe dinamicamente a **última entrada do período**
- Card de saídas exibe dinamicamente a **última saída do período**
- Card de saldo total exibe status dinâmico:
  - `Saldo Positivo`
  - `Saldo Negativo`
  - `Saldo Zerado`
- Fallbacks para períodos sem movimentação:
  - `Sem valores de entrada no período`
  - `Sem valores de saída no período`

### 7) Tema (dark/light) com preferência do sistema

- Tema padrão segue `prefers-color-scheme` quando não existe preferência salva
- Clique no botão de tema define preferência explícita (`localStorage`) e passa a ter prioridade sobre o sistema
- Mudança de tema do sistema é aplicada em tempo real apenas quando não existe preferência do usuário
- Implementação baseada em `[data-theme="dark"]` no CSS e atributo `data-theme` no `documentElement`
- A preferência é salva na chave `dashboard-financer:theme` (evita conflito com chaves genéricas)

---

## Principais desafios encontrados e soluções aplicadas

### Desafio: cards e tabela mostravam contextos diferentes

- **Problema**: tabela filtrada por mês, mas cards com totais globais
- **Solução**: cálculo dos cards passou a usar somente transações filtradas no `render()`

### Desafio: erro `NaN` nos cards

- **Problema**: valor numérico era sobrescrito por string formatada antes dos cálculos
- **Solução**: manter valor bruto para cálculo e usar valor formatado apenas na renderização

### Desafio: filtro mensal quebrava com dados inválidos

- **Problema**: parsing frágil da data
- **Solução**: validações em sequência (existência, tipo, estrutura, número e faixa)

### Desafio: atualizações visuais duplicadas

- **Problema**: chamadas diretas de View fora do fluxo principal
- **Solução**: reforço do `render()` como funil principal de atualização

---

## Em que estamos trabalhando agora

Refino de conteúdo e estado visual dos cards:

- Consolidar estado visual do card total com base no status dinâmico do saldo
- Garantir consistência final entre texto, valor e estilo em todos os cenários

Evolução de UX:

- Ajustar e evoluir a experiência do tema (ícone/label e opção “voltar a seguir o sistema”, se necessário)

---

## Próximos passos planejados

- Finalizar a regra visual do card total para refletir `Positivo/Negativo/Zerado`
- Melhorar UX do formulário (mensagens por campo e highlights de erro)
- Melhorar robustez com testes de cenários críticos (mês vazio, virada de ano, dados inválidos)

---

## Histórico de evolução (changelog)

### Sprint atual

- Estruturado estado mensal de navegação com atualização de header por período
- Consolidado fluxo de renderização único no controller para evitar divergências visuais
- Implementado filtro mensal com validações de robustez para datas inválidas
- Corrigido cálculo dos cards para usar apenas transações filtradas do período ativo
- Padronizada formatação monetária em `pt-BR` / `BRL` para cards e tabela
- Adicionados textos dinâmicos para cards de entrada e saída com fallback em período vazio
- Definida regra dinâmica de status do saldo total:
  - `Saldo Positivo`
  - `Saldo Negativo`
  - `Saldo Zerado`
- Implementado tema dark/light:
  - segue tema do sistema quando não há preferência salva
  - persiste preferência do usuário quando o toggle é utilizado
- Melhorada validação do formulário:
  - bloqueia submit com dados inválidos
  - evita erro quando tipo de transação não está selecionado

### Correções relevantes aplicadas

- Correção de inconsistência entre tabela filtrada e cards globais
- Correção de `NaN` causado por mistura de número e string formatada no cálculo
- Correção de parsing de data para seleção da última transação do período
- Ajuste de formatação para separar claramente cálculo numérico e exibição textual

---

## Como instalar e executar localmente

### Pré-requisitos

- Node.js (recomendado versão LTS)
- npm

### Instalação

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
cd dashboard-financer
```

2. Instale as dependências:

```bash
npm install
```

### Executar em modo desenvolvimento

```bash
npm run dev
```

O Vite exibirá a URL local (normalmente `http://localhost:5173`).

### Gerar build de produção

```bash
npm run build
```

### Executar preview da build

```bash
npm run preview
```

---

## Scripts disponíveis

- `npm run dev` → inicia servidor de desenvolvimento
- `npm run build` → gera build de produção
- `npm run preview` → sobe preview da build gerada

---

## Estrutura principal

```text
src/
  js/
    app.js
    controllers/
      AppControllers.js
      ThemeController.js
    models/
      Wallet.js
      Transaction.js
    views/
      DashboardViews.js
  css/
    style.css
index.html
```

---

## Estado atual do projeto

O fluxo principal de transações e navegação mensal está funcional, com melhora relevante de consistência entre dados e interface. O foco atual é finalizar os refinamentos de UX nos cards e consolidar os próximos incrementos.
