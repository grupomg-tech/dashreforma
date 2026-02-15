

# Dashboard de Reforma Tributária Brasileira

## Visão Geral
Dashboard interativo que consome uma API externa para exibir dados comparativos entre o sistema tributário atual e a reforma tributária proposta, com gráficos e cards de resumo.

---

## Funcionalidades

### 1. Formulário de Filtros (Topo da página)
- Campo para ID da empresa (valor padrão: 2)
- Seletor de período inicial no formato mês/ano (padrão: 2025-01)
- Seletor de período final no formato mês/ano (padrão: 2025-01)
- Botão "Buscar Dados" que dispara a consulta à API
- Carregamento automático dos dados ao abrir a página com os valores padrão

### 2. Cards de Resumo (2 colunas)
- **Card Sistema Atual** (tema azul #4e6ae9): Débitos, Créditos, Resultado e Carga Tributária Efetiva
- **Card Reforma** (tema roxo #764ba2): Débitos, Créditos, Resultado e Carga Tributária Efetiva
- Valores formatados em R$ e %, com efeitos de hover e sombras

### 3. Gráficos de Barra (2 colunas)
- **Carga Tributária - Compras**: barras comparando Sistema Atual vs Reforma
- **Carga Tributária - Vendas**: barras comparando Sistema Atual vs Reforma
- Usando Recharts com as cores azul e roxo para diferenciação

### 4. Gráficos de Pizza (2 colunas)
- **Distribuição Tributos nas Entradas**: ICMS, PIS, COFINS, IBS/CBS
- **Distribuição Tributos nas Saídas**: ICMS, PIS, COFINS, IBS/CBS
- Cores distintas para cada tributo (azul, roxo, verde, laranja)

### 5. Design e UX
- Fundo com gradiente suave (azul → roxo → rosa)
- Cards com sombra e animação de hover
- Estado de carregamento animado (skeleton/spinner)
- Mensagens de erro amigáveis em caso de falha na API
- Layout responsivo adaptado para mobile e desktop
- Header com título do dashboard

