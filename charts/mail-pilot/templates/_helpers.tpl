{{/*
Expand the name of the chart.
*/}}
{{- define "mail-pilot.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "mail-pilot.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{- define "mail-pilot.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "mail-pilot.labels" -}}
helm.sh/chart: {{ include "mail-pilot.chart" . }}
app.kubernetes.io/name: {{ include "mail-pilot.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "mail-pilot.selectorLabels" -}}
app.kubernetes.io/name: {{ include "mail-pilot.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "mail-pilot.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
{{- default (include "mail-pilot.fullname" .) .Values.serviceAccount.name -}}
{{- else -}}
{{- default "default" .Values.serviceAccount.name -}}
{{- end -}}
{{- end -}}

{{- define "mail-pilot.configMapName" -}}
{{- default (printf "%s-config" (include "mail-pilot.fullname" .)) .Values.existingConfigMap -}}
{{- end -}}

{{- define "mail-pilot.secretName" -}}
{{- default (printf "%s-secret" (include "mail-pilot.fullname" .)) .Values.existingSecret -}}
{{- end -}}

{{- define "mail-pilot.webServiceName" -}}
{{- printf "%s-web" (include "mail-pilot.fullname" .) -}}
{{- end -}}

{{- define "mail-pilot.postgresqlServiceName" -}}
{{- printf "%s-postgresql" (include "mail-pilot.fullname" .) -}}
{{- end -}}

{{- define "mail-pilot.redisServiceName" -}}
{{- printf "%s-redis" (include "mail-pilot.fullname" .) -}}
{{- end -}}

{{- define "mail-pilot.redisHttpServiceName" -}}
{{- printf "%s-redis-http" (include "mail-pilot.fullname" .) -}}
{{- end -}}

{{- define "mail-pilot.databaseUrl" -}}
{{- $password := required "postgresql.auth.password is required when using bundled Postgres" .Values.postgresql.auth.password -}}
{{- printf "postgresql://%s:%s@%s:5432/%s?schema=public" (.Values.postgresql.auth.username | urlquery) ($password | urlquery) (include "mail-pilot.postgresqlServiceName" .) (.Values.postgresql.auth.database | urlquery) -}}
{{- end -}}

{{- define "mail-pilot.redisUrl" -}}
{{- $password := required "redis.auth.password is required when using bundled Redis" .Values.redis.auth.password -}}
{{- printf "redis://:%s@%s:6379" ($password | urlquery) (include "mail-pilot.redisServiceName" .) -}}
{{- end -}}

{{- define "mail-pilot.redisHttpUrl" -}}
{{- printf "http://%s:80" (include "mail-pilot.redisHttpServiceName" .) -}}
{{- end -}}

{{- define "mail-pilot.internalApiUrl" -}}
{{- printf "http://%s:%v" (include "mail-pilot.webServiceName" .) .Values.service.port -}}
{{- end -}}

{{- define "mail-pilot.externalDatabaseEnvRefs" -}}
{{- if and .Values.externalDatabase.enabled .Values.externalDatabase.existingSecret.name }}
- name: DATABASE_URL
  valueFrom:
    secretKeyRef:
      name: {{ .Values.externalDatabase.existingSecret.name }}
      key: {{ .Values.externalDatabase.existingSecret.databaseUrlKey }}
- name: DIRECT_URL
  valueFrom:
    secretKeyRef:
      name: {{ .Values.externalDatabase.existingSecret.name }}
      key: {{ .Values.externalDatabase.existingSecret.directUrlKey }}
{{- end }}
{{- end -}}

{{- define "mail-pilot.externalRedisEnvRefs" -}}
{{- if and .Values.externalRedis.enabled .Values.externalRedis.existingSecret.name }}
- name: REDIS_URL
  valueFrom:
    secretKeyRef:
      name: {{ .Values.externalRedis.existingSecret.name }}
      key: {{ .Values.externalRedis.existingSecret.redisUrlKey }}
{{- $secretName := .Values.externalRedis.existingSecret.name }}
{{- $urlKey := .Values.externalRedis.existingSecret.redisHttpUrlKey }}
{{- $tokenKey := .Values.externalRedis.existingSecret.redisHttpTokenKey }}
{{- $legacyUrlKey := .Values.externalRedis.existingSecret.upstashRedisUrlKey }}
{{- $legacyTokenKey := .Values.externalRedis.existingSecret.upstashRedisTokenKey }}
{{ if or $urlKey $tokenKey }}
- name: REDIS_HTTP_URL
  valueFrom:
    secretKeyRef:
      name: {{ $secretName }}
      key: {{ $urlKey | default "REDIS_HTTP_URL" }}
- name: REDIS_HTTP_TOKEN
  valueFrom:
    secretKeyRef:
      name: {{ $secretName }}
      key: {{ $tokenKey | default "REDIS_HTTP_TOKEN" }}
{{ else if or $legacyUrlKey $legacyTokenKey }}
- name: UPSTASH_REDIS_URL
  valueFrom:
    secretKeyRef:
      name: {{ $secretName }}
      key: {{ $legacyUrlKey | default "UPSTASH_REDIS_URL" }}
- name: UPSTASH_REDIS_TOKEN
  valueFrom:
    secretKeyRef:
      name: {{ $secretName }}
      key: {{ $legacyTokenKey | default "UPSTASH_REDIS_TOKEN" }}
{{ else }}
- name: REDIS_HTTP_URL
  valueFrom:
    secretKeyRef:
      name: {{ $secretName }}
      key: REDIS_HTTP_URL
      optional: true
- name: REDIS_HTTP_TOKEN
  valueFrom:
    secretKeyRef:
      name: {{ $secretName }}
      key: REDIS_HTTP_TOKEN
      optional: true
- name: UPSTASH_REDIS_URL
  valueFrom:
    secretKeyRef:
      name: {{ $secretName }}
      key: UPSTASH_REDIS_URL
      optional: true
- name: UPSTASH_REDIS_TOKEN
  valueFrom:
    secretKeyRef:
      name: {{ $secretName }}
      key: UPSTASH_REDIS_TOKEN
      optional: true
{{ end }}
{{- end }}
{{- end -}}

{{- define "mail-pilot.migrationDatabaseEnv" -}}
{{- if and .Values.externalDatabase.enabled .Values.externalDatabase.existingSecret.name }}
{{- include "mail-pilot.externalDatabaseEnvRefs" . }}
{{- else if and .Values.externalDatabase.enabled .Values.existingSecret }}
- name: DATABASE_URL
  valueFrom:
    secretKeyRef:
      name: {{ include "mail-pilot.secretName" . }}
      key: DATABASE_URL
- name: DIRECT_URL
  valueFrom:
    secretKeyRef:
      name: {{ include "mail-pilot.secretName" . }}
      key: DIRECT_URL
{{- else if .Values.externalDatabase.enabled }}
- name: DATABASE_URL
  value: {{ required "externalDatabase.databaseUrl is required when externalDatabase.enabled=true and no externalDatabase.existingSecret.name is set" .Values.externalDatabase.databaseUrl | quote }}
- name: DIRECT_URL
  value: {{ default .Values.externalDatabase.databaseUrl .Values.externalDatabase.directUrl | quote }}
{{- else if and .Values.postgresql.enabled (not .Values.externalDatabase.enabled) }}
- name: DATABASE_URL
  value: {{ include "mail-pilot.databaseUrl" . | quote }}
- name: DIRECT_URL
  value: {{ include "mail-pilot.databaseUrl" . | quote }}
{{- else if .Values.existingSecret }}
- name: DATABASE_URL
  valueFrom:
    secretKeyRef:
      name: {{ include "mail-pilot.secretName" . }}
      key: DATABASE_URL
- name: DIRECT_URL
  valueFrom:
    secretKeyRef:
      name: {{ include "mail-pilot.secretName" . }}
      key: DIRECT_URL
{{- else if index .Values.secretEnv "DATABASE_URL" }}
- name: DATABASE_URL
  value: {{ index .Values.secretEnv "DATABASE_URL" | quote }}
- name: DIRECT_URL
  value: {{ default (index .Values.secretEnv "DATABASE_URL") (index .Values.secretEnv "DIRECT_URL") | quote }}
{{- end }}
{{- end -}}
