import scenarioManifest from "./admin-scenarios.json";

export const ADMIN_CAPTURE_VIEWPORT = {
  width: 1440,
  height: 1024,
};

export const adminScenarioManifest = scenarioManifest;

export function getAdminScenarioDefinition(scenarioId) {
  if (!scenarioId) {
    return null;
  }

  return adminScenarioManifest.find((scenario) => scenario.scenarioId === scenarioId) ?? null;
}

export function isAdminScenario(scenarioId, expectedScenarioId) {
  return scenarioId === expectedScenarioId;
}
