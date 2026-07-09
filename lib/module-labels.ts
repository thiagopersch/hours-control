const MODULE_LABELS: Record<string, string> = {
  demand: "Demandas",
  client: "Clientes",
  analyst: "Analistas",
  contract: "Contratos",
  requester: "Solicitantes",
  department: "Setores",
  demand_type: "Tipos de Demanda",
  tag: "Tags",
  user: "Usuários",
  role: "Perfis",
  report: "Relatórios",
  notification: "Notificações",
  settings: "Configurações",
}

export function moduleLabel(resource: string): string {
  return MODULE_LABELS[resource] ?? resource
}
