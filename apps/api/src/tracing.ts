import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
const serviceName = process.env.OTEL_SERVICE_NAME ?? 'coparent-api';

if (otlpEndpoint) {
  const sdk = new NodeSDK({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: serviceName
    }),
    traceExporter: new OTLPTraceExporter({
      url: otlpEndpoint
    }),
    metricReader: new PrometheusExporter({ port: 9464 }),
    instrumentations: [getNodeAutoInstrumentations()]
  });

  sdk.start();

  process.on('SIGTERM', () => {
    sdk.shutdown();
  });
}
