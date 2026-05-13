import * as appInsights from 'applicationinsights';

export function setupTelemetry() {
  if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    appInsights
      .setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, true) 
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true)
      .setUseDiskRetryCaching(true)
      .start();
    console.log('✅ Application Insights iniciado');
  } else {
    console.warn('⚠️ Application Insights no configurado (falta CONNECTION_STRING)');
  }
}