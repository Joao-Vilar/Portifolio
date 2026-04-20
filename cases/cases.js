window.portfolioCases = [
  // Exemplo de imagem:
  // image: "cases/images/nome-do-arquivo.png"
{
  id: "idor",
  image: "cases/images/burp.jpg",
  tag: "IDOR",
  severity: "Critical",
  severityClass: "severity-critical",
  title: "Case 001 - Acesso Sem Permissão",
  summary:
    "Identificação de falha de autorização em recurso interno que permitia o acesso indevido a registros de terceiros por meio da manipulação previsível de identificadores.",
  type: "Insecure Direct Object Reference (IDOR)",
  description:
    "Durante a análise de um fluxo autenticado, foram interceptadas requisições relacionadas à consulta de registros individuais. Ao modificar manualmente os identificadores transmitidos na requisição, foi possível acessar dados pertencentes a outros usuários, sem que houvesse validação adequada de autorização por parte do backend. A validação foi conduzida de forma controlada, limitada à confirmação da vulnerabilidade, sem qualquer extração massiva de dados, mantendo o contexto totalmente anonimizado.",
  impact:
    "A ausência de validação de autorização por objeto permitia acesso indevido a dados de outros usuários, caracterizando uma falha crítica de controle de acesso. Dependendo do contexto da aplicação, isso poderia resultar em exposição de informações sensíveis, violação de privacidade e potenciais implicações legais.",
  methodology:
    "Enumeração manual de identificadores em requisições autenticadas, análise comparativa de respostas e validação de inconsistência de contexto entre diferentes usuários.",
  learning:
    "Este caso evidenciou que mecanismos de autenticação, isoladamente, não garantem segurança sem validação adequada de autorização. Reforçou também a necessidade de tratar identificadores como dados não confiáveis, mesmo quando originados de fluxos autenticados.",
  recommendations:
    "Implementar verificação contextual de ownership em todas as rotas críticas, garantir validação server-side consistente e registrar em auditoria tentativas de acesso inconsistentes ou não autorizadas."
}
]
