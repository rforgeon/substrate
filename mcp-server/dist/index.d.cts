import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as zod from 'zod';
import { z } from 'zod';

declare const ObservationCategory: z.ZodEnum<["behavior", "error", "auth", "rate_limit", "format"]>;
type ObservationCategory = z.infer<typeof ObservationCategory>;
declare const ObservationStatus: z.ZodEnum<["pending", "confirmed", "contradicted", "stale"]>;
type ObservationStatus = z.infer<typeof ObservationStatus>;
declare const UrgencyLevel: z.ZodEnum<["normal", "high", "critical"]>;
type UrgencyLevel = z.infer<typeof UrgencyLevel>;
declare const BehaviorData: z.ZodObject<{
    element: z.ZodOptional<z.ZodString>;
    action: z.ZodOptional<z.ZodString>;
    expected_result: z.ZodOptional<z.ZodString>;
    actual_result: z.ZodOptional<z.ZodString>;
    workaround: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    element?: string | undefined;
    action?: string | undefined;
    expected_result?: string | undefined;
    actual_result?: string | undefined;
    workaround?: string | undefined;
}, {
    element?: string | undefined;
    action?: string | undefined;
    expected_result?: string | undefined;
    actual_result?: string | undefined;
    workaround?: string | undefined;
}>;
declare const ErrorData: z.ZodObject<{
    error_code: z.ZodOptional<z.ZodString>;
    error_message: z.ZodOptional<z.ZodString>;
    trigger: z.ZodOptional<z.ZodString>;
    resolution: z.ZodOptional<z.ZodString>;
    recoverable: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    error_code?: string | undefined;
    error_message?: string | undefined;
    trigger?: string | undefined;
    resolution?: string | undefined;
    recoverable?: boolean | undefined;
}, {
    error_code?: string | undefined;
    error_message?: string | undefined;
    trigger?: string | undefined;
    resolution?: string | undefined;
    recoverable?: boolean | undefined;
}>;
declare const AuthData: z.ZodObject<{
    method: z.ZodOptional<z.ZodString>;
    header: z.ZodOptional<z.ZodString>;
    token_location: z.ZodOptional<z.ZodString>;
    session_duration: z.ZodOptional<z.ZodString>;
    refresh_mechanism: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    method?: string | undefined;
    header?: string | undefined;
    token_location?: string | undefined;
    session_duration?: string | undefined;
    refresh_mechanism?: string | undefined;
}, {
    method?: string | undefined;
    header?: string | undefined;
    token_location?: string | undefined;
    session_duration?: string | undefined;
    refresh_mechanism?: string | undefined;
}>;
declare const RateLimitData: z.ZodObject<{
    limit: z.ZodOptional<z.ZodNumber>;
    window: z.ZodOptional<z.ZodString>;
    header_remaining: z.ZodOptional<z.ZodString>;
    header_reset: z.ZodOptional<z.ZodString>;
    retry_after: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit?: number | undefined;
    window?: string | undefined;
    header_remaining?: string | undefined;
    header_reset?: string | undefined;
    retry_after?: string | undefined;
}, {
    limit?: number | undefined;
    window?: string | undefined;
    header_remaining?: string | undefined;
    header_reset?: string | undefined;
    retry_after?: string | undefined;
}>;
declare const FormatData: z.ZodObject<{
    field: z.ZodOptional<z.ZodString>;
    format: z.ZodOptional<z.ZodString>;
    validation_regex: z.ZodOptional<z.ZodString>;
    encoding: z.ZodOptional<z.ZodString>;
    max_length: z.ZodOptional<z.ZodNumber>;
    required: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    format?: string | undefined;
    field?: string | undefined;
    validation_regex?: string | undefined;
    encoding?: string | undefined;
    max_length?: number | undefined;
    required?: boolean | undefined;
}, {
    format?: string | undefined;
    field?: string | undefined;
    validation_regex?: string | undefined;
    encoding?: string | undefined;
    max_length?: number | undefined;
    required?: boolean | undefined;
}>;
declare const StructuredData: z.ZodUnion<[z.ZodObject<{
    element: z.ZodOptional<z.ZodString>;
    action: z.ZodOptional<z.ZodString>;
    expected_result: z.ZodOptional<z.ZodString>;
    actual_result: z.ZodOptional<z.ZodString>;
    workaround: z.ZodOptional<z.ZodString>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    element: z.ZodOptional<z.ZodString>;
    action: z.ZodOptional<z.ZodString>;
    expected_result: z.ZodOptional<z.ZodString>;
    actual_result: z.ZodOptional<z.ZodString>;
    workaround: z.ZodOptional<z.ZodString>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    element: z.ZodOptional<z.ZodString>;
    action: z.ZodOptional<z.ZodString>;
    expected_result: z.ZodOptional<z.ZodString>;
    actual_result: z.ZodOptional<z.ZodString>;
    workaround: z.ZodOptional<z.ZodString>;
}, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
    error_code: z.ZodOptional<z.ZodString>;
    error_message: z.ZodOptional<z.ZodString>;
    trigger: z.ZodOptional<z.ZodString>;
    resolution: z.ZodOptional<z.ZodString>;
    recoverable: z.ZodOptional<z.ZodBoolean>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    error_code: z.ZodOptional<z.ZodString>;
    error_message: z.ZodOptional<z.ZodString>;
    trigger: z.ZodOptional<z.ZodString>;
    resolution: z.ZodOptional<z.ZodString>;
    recoverable: z.ZodOptional<z.ZodBoolean>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    error_code: z.ZodOptional<z.ZodString>;
    error_message: z.ZodOptional<z.ZodString>;
    trigger: z.ZodOptional<z.ZodString>;
    resolution: z.ZodOptional<z.ZodString>;
    recoverable: z.ZodOptional<z.ZodBoolean>;
}, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
    method: z.ZodOptional<z.ZodString>;
    header: z.ZodOptional<z.ZodString>;
    token_location: z.ZodOptional<z.ZodString>;
    session_duration: z.ZodOptional<z.ZodString>;
    refresh_mechanism: z.ZodOptional<z.ZodString>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    method: z.ZodOptional<z.ZodString>;
    header: z.ZodOptional<z.ZodString>;
    token_location: z.ZodOptional<z.ZodString>;
    session_duration: z.ZodOptional<z.ZodString>;
    refresh_mechanism: z.ZodOptional<z.ZodString>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    method: z.ZodOptional<z.ZodString>;
    header: z.ZodOptional<z.ZodString>;
    token_location: z.ZodOptional<z.ZodString>;
    session_duration: z.ZodOptional<z.ZodString>;
    refresh_mechanism: z.ZodOptional<z.ZodString>;
}, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
    limit: z.ZodOptional<z.ZodNumber>;
    window: z.ZodOptional<z.ZodString>;
    header_remaining: z.ZodOptional<z.ZodString>;
    header_reset: z.ZodOptional<z.ZodString>;
    retry_after: z.ZodOptional<z.ZodString>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    limit: z.ZodOptional<z.ZodNumber>;
    window: z.ZodOptional<z.ZodString>;
    header_remaining: z.ZodOptional<z.ZodString>;
    header_reset: z.ZodOptional<z.ZodString>;
    retry_after: z.ZodOptional<z.ZodString>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    limit: z.ZodOptional<z.ZodNumber>;
    window: z.ZodOptional<z.ZodString>;
    header_remaining: z.ZodOptional<z.ZodString>;
    header_reset: z.ZodOptional<z.ZodString>;
    retry_after: z.ZodOptional<z.ZodString>;
}, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
    field: z.ZodOptional<z.ZodString>;
    format: z.ZodOptional<z.ZodString>;
    validation_regex: z.ZodOptional<z.ZodString>;
    encoding: z.ZodOptional<z.ZodString>;
    max_length: z.ZodOptional<z.ZodNumber>;
    required: z.ZodOptional<z.ZodBoolean>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    field: z.ZodOptional<z.ZodString>;
    format: z.ZodOptional<z.ZodString>;
    validation_regex: z.ZodOptional<z.ZodString>;
    encoding: z.ZodOptional<z.ZodString>;
    max_length: z.ZodOptional<z.ZodNumber>;
    required: z.ZodOptional<z.ZodBoolean>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    field: z.ZodOptional<z.ZodString>;
    format: z.ZodOptional<z.ZodString>;
    validation_regex: z.ZodOptional<z.ZodString>;
    encoding: z.ZodOptional<z.ZodString>;
    max_length: z.ZodOptional<z.ZodNumber>;
    required: z.ZodOptional<z.ZodBoolean>;
}, z.ZodTypeAny, "passthrough">>, z.ZodRecord<z.ZodString, z.ZodUnknown>]>;
type StructuredData = z.infer<typeof StructuredData>;
declare const ImpactEstimate: z.ZodObject<{
    time_saved_seconds: z.ZodOptional<z.ZodNumber>;
    success_rate_improvement: z.ZodOptional<z.ZodNumber>;
    reasoning: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    time_saved_seconds?: number | undefined;
    success_rate_improvement?: number | undefined;
    reasoning?: string | undefined;
}, {
    time_saved_seconds?: number | undefined;
    success_rate_improvement?: number | undefined;
    reasoning?: string | undefined;
}>;
type ImpactEstimate = z.infer<typeof ImpactEstimate>;
declare const ImpactReport: z.ZodObject<{
    agent_hash: z.ZodString;
    actual_time_saved_seconds: z.ZodOptional<z.ZodNumber>;
    task_succeeded: z.ZodOptional<z.ZodBoolean>;
    helpful: z.ZodBoolean;
    feedback: z.ZodOptional<z.ZodString>;
    reported_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    agent_hash: string;
    helpful: boolean;
    reported_at: string;
    actual_time_saved_seconds?: number | undefined;
    task_succeeded?: boolean | undefined;
    feedback?: string | undefined;
}, {
    agent_hash: string;
    helpful: boolean;
    reported_at: string;
    actual_time_saved_seconds?: number | undefined;
    task_succeeded?: boolean | undefined;
    feedback?: string | undefined;
}>;
type ImpactReport = z.infer<typeof ImpactReport>;
declare const ImpactStats: z.ZodObject<{
    total_uses: z.ZodDefault<z.ZodNumber>;
    helpful_count: z.ZodDefault<z.ZodNumber>;
    avg_time_saved_seconds: z.ZodOptional<z.ZodNumber>;
    success_rate: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    total_uses: number;
    helpful_count: number;
    avg_time_saved_seconds?: number | undefined;
    success_rate?: number | undefined;
}, {
    total_uses?: number | undefined;
    helpful_count?: number | undefined;
    avg_time_saved_seconds?: number | undefined;
    success_rate?: number | undefined;
}>;
type ImpactStats = z.infer<typeof ImpactStats>;
declare const Observation: z.ZodObject<{
    id: z.ZodString;
    agent_hash: z.ZodString;
    domain: z.ZodString;
    path: z.ZodOptional<z.ZodString>;
    category: z.ZodEnum<["behavior", "error", "auth", "rate_limit", "format"]>;
    summary: z.ZodString;
    structured_data: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
        element: z.ZodOptional<z.ZodString>;
        action: z.ZodOptional<z.ZodString>;
        expected_result: z.ZodOptional<z.ZodString>;
        actual_result: z.ZodOptional<z.ZodString>;
        workaround: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        element: z.ZodOptional<z.ZodString>;
        action: z.ZodOptional<z.ZodString>;
        expected_result: z.ZodOptional<z.ZodString>;
        actual_result: z.ZodOptional<z.ZodString>;
        workaround: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        element: z.ZodOptional<z.ZodString>;
        action: z.ZodOptional<z.ZodString>;
        expected_result: z.ZodOptional<z.ZodString>;
        actual_result: z.ZodOptional<z.ZodString>;
        workaround: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
        error_code: z.ZodOptional<z.ZodString>;
        error_message: z.ZodOptional<z.ZodString>;
        trigger: z.ZodOptional<z.ZodString>;
        resolution: z.ZodOptional<z.ZodString>;
        recoverable: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        error_code: z.ZodOptional<z.ZodString>;
        error_message: z.ZodOptional<z.ZodString>;
        trigger: z.ZodOptional<z.ZodString>;
        resolution: z.ZodOptional<z.ZodString>;
        recoverable: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        error_code: z.ZodOptional<z.ZodString>;
        error_message: z.ZodOptional<z.ZodString>;
        trigger: z.ZodOptional<z.ZodString>;
        resolution: z.ZodOptional<z.ZodString>;
        recoverable: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
        method: z.ZodOptional<z.ZodString>;
        header: z.ZodOptional<z.ZodString>;
        token_location: z.ZodOptional<z.ZodString>;
        session_duration: z.ZodOptional<z.ZodString>;
        refresh_mechanism: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        method: z.ZodOptional<z.ZodString>;
        header: z.ZodOptional<z.ZodString>;
        token_location: z.ZodOptional<z.ZodString>;
        session_duration: z.ZodOptional<z.ZodString>;
        refresh_mechanism: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        method: z.ZodOptional<z.ZodString>;
        header: z.ZodOptional<z.ZodString>;
        token_location: z.ZodOptional<z.ZodString>;
        session_duration: z.ZodOptional<z.ZodString>;
        refresh_mechanism: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
        limit: z.ZodOptional<z.ZodNumber>;
        window: z.ZodOptional<z.ZodString>;
        header_remaining: z.ZodOptional<z.ZodString>;
        header_reset: z.ZodOptional<z.ZodString>;
        retry_after: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        limit: z.ZodOptional<z.ZodNumber>;
        window: z.ZodOptional<z.ZodString>;
        header_remaining: z.ZodOptional<z.ZodString>;
        header_reset: z.ZodOptional<z.ZodString>;
        retry_after: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        limit: z.ZodOptional<z.ZodNumber>;
        window: z.ZodOptional<z.ZodString>;
        header_remaining: z.ZodOptional<z.ZodString>;
        header_reset: z.ZodOptional<z.ZodString>;
        retry_after: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
        field: z.ZodOptional<z.ZodString>;
        format: z.ZodOptional<z.ZodString>;
        validation_regex: z.ZodOptional<z.ZodString>;
        encoding: z.ZodOptional<z.ZodString>;
        max_length: z.ZodOptional<z.ZodNumber>;
        required: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        field: z.ZodOptional<z.ZodString>;
        format: z.ZodOptional<z.ZodString>;
        validation_regex: z.ZodOptional<z.ZodString>;
        encoding: z.ZodOptional<z.ZodString>;
        max_length: z.ZodOptional<z.ZodNumber>;
        required: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        field: z.ZodOptional<z.ZodString>;
        format: z.ZodOptional<z.ZodString>;
        validation_regex: z.ZodOptional<z.ZodString>;
        encoding: z.ZodOptional<z.ZodString>;
        max_length: z.ZodOptional<z.ZodNumber>;
        required: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>, z.ZodRecord<z.ZodString, z.ZodUnknown>]>>;
    impact_estimate: z.ZodOptional<z.ZodObject<{
        time_saved_seconds: z.ZodOptional<z.ZodNumber>;
        success_rate_improvement: z.ZodOptional<z.ZodNumber>;
        reasoning: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        time_saved_seconds?: number | undefined;
        success_rate_improvement?: number | undefined;
        reasoning?: string | undefined;
    }, {
        time_saved_seconds?: number | undefined;
        success_rate_improvement?: number | undefined;
        reasoning?: string | undefined;
    }>>;
    impact_reports: z.ZodDefault<z.ZodArray<z.ZodObject<{
        agent_hash: z.ZodString;
        actual_time_saved_seconds: z.ZodOptional<z.ZodNumber>;
        task_succeeded: z.ZodOptional<z.ZodBoolean>;
        helpful: z.ZodBoolean;
        feedback: z.ZodOptional<z.ZodString>;
        reported_at: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        agent_hash: string;
        helpful: boolean;
        reported_at: string;
        actual_time_saved_seconds?: number | undefined;
        task_succeeded?: boolean | undefined;
        feedback?: string | undefined;
    }, {
        agent_hash: string;
        helpful: boolean;
        reported_at: string;
        actual_time_saved_seconds?: number | undefined;
        task_succeeded?: boolean | undefined;
        feedback?: string | undefined;
    }>, "many">>;
    impact_stats: z.ZodOptional<z.ZodObject<{
        total_uses: z.ZodDefault<z.ZodNumber>;
        helpful_count: z.ZodDefault<z.ZodNumber>;
        avg_time_saved_seconds: z.ZodOptional<z.ZodNumber>;
        success_rate: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        total_uses: number;
        helpful_count: number;
        avg_time_saved_seconds?: number | undefined;
        success_rate?: number | undefined;
    }, {
        total_uses?: number | undefined;
        helpful_count?: number | undefined;
        avg_time_saved_seconds?: number | undefined;
        success_rate?: number | undefined;
    }>>;
    status: z.ZodDefault<z.ZodEnum<["pending", "confirmed", "contradicted", "stale"]>>;
    confirmations: z.ZodDefault<z.ZodNumber>;
    confirming_agents: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    confidence: z.ZodDefault<z.ZodNumber>;
    urgency: z.ZodDefault<z.ZodEnum<["normal", "high", "critical"]>>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
    expires_at: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "confirmed" | "contradicted" | "stale";
    id: string;
    agent_hash: string;
    domain: string;
    category: "error" | "behavior" | "auth" | "rate_limit" | "format";
    summary: string;
    impact_reports: {
        agent_hash: string;
        helpful: boolean;
        reported_at: string;
        actual_time_saved_seconds?: number | undefined;
        task_succeeded?: boolean | undefined;
        feedback?: string | undefined;
    }[];
    confirmations: number;
    confirming_agents: string[];
    confidence: number;
    urgency: "normal" | "high" | "critical";
    tags: string[];
    created_at: string;
    updated_at: string;
    path?: string | undefined;
    structured_data?: Record<string, unknown> | z.objectOutputType<{
        element: z.ZodOptional<z.ZodString>;
        action: z.ZodOptional<z.ZodString>;
        expected_result: z.ZodOptional<z.ZodString>;
        actual_result: z.ZodOptional<z.ZodString>;
        workaround: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
        error_code: z.ZodOptional<z.ZodString>;
        error_message: z.ZodOptional<z.ZodString>;
        trigger: z.ZodOptional<z.ZodString>;
        resolution: z.ZodOptional<z.ZodString>;
        recoverable: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
        method: z.ZodOptional<z.ZodString>;
        header: z.ZodOptional<z.ZodString>;
        token_location: z.ZodOptional<z.ZodString>;
        session_duration: z.ZodOptional<z.ZodString>;
        refresh_mechanism: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
        limit: z.ZodOptional<z.ZodNumber>;
        window: z.ZodOptional<z.ZodString>;
        header_remaining: z.ZodOptional<z.ZodString>;
        header_reset: z.ZodOptional<z.ZodString>;
        retry_after: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
        field: z.ZodOptional<z.ZodString>;
        format: z.ZodOptional<z.ZodString>;
        validation_regex: z.ZodOptional<z.ZodString>;
        encoding: z.ZodOptional<z.ZodString>;
        max_length: z.ZodOptional<z.ZodNumber>;
        required: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    impact_estimate?: {
        time_saved_seconds?: number | undefined;
        success_rate_improvement?: number | undefined;
        reasoning?: string | undefined;
    } | undefined;
    impact_stats?: {
        total_uses: number;
        helpful_count: number;
        avg_time_saved_seconds?: number | undefined;
        success_rate?: number | undefined;
    } | undefined;
    expires_at?: string | undefined;
}, {
    id: string;
    agent_hash: string;
    domain: string;
    category: "error" | "behavior" | "auth" | "rate_limit" | "format";
    summary: string;
    created_at: string;
    updated_at: string;
    path?: string | undefined;
    status?: "pending" | "confirmed" | "contradicted" | "stale" | undefined;
    structured_data?: Record<string, unknown> | z.objectInputType<{
        element: z.ZodOptional<z.ZodString>;
        action: z.ZodOptional<z.ZodString>;
        expected_result: z.ZodOptional<z.ZodString>;
        actual_result: z.ZodOptional<z.ZodString>;
        workaround: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
        error_code: z.ZodOptional<z.ZodString>;
        error_message: z.ZodOptional<z.ZodString>;
        trigger: z.ZodOptional<z.ZodString>;
        resolution: z.ZodOptional<z.ZodString>;
        recoverable: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
        method: z.ZodOptional<z.ZodString>;
        header: z.ZodOptional<z.ZodString>;
        token_location: z.ZodOptional<z.ZodString>;
        session_duration: z.ZodOptional<z.ZodString>;
        refresh_mechanism: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
        limit: z.ZodOptional<z.ZodNumber>;
        window: z.ZodOptional<z.ZodString>;
        header_remaining: z.ZodOptional<z.ZodString>;
        header_reset: z.ZodOptional<z.ZodString>;
        retry_after: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
        field: z.ZodOptional<z.ZodString>;
        format: z.ZodOptional<z.ZodString>;
        validation_regex: z.ZodOptional<z.ZodString>;
        encoding: z.ZodOptional<z.ZodString>;
        max_length: z.ZodOptional<z.ZodNumber>;
        required: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    impact_estimate?: {
        time_saved_seconds?: number | undefined;
        success_rate_improvement?: number | undefined;
        reasoning?: string | undefined;
    } | undefined;
    impact_reports?: {
        agent_hash: string;
        helpful: boolean;
        reported_at: string;
        actual_time_saved_seconds?: number | undefined;
        task_succeeded?: boolean | undefined;
        feedback?: string | undefined;
    }[] | undefined;
    impact_stats?: {
        total_uses?: number | undefined;
        helpful_count?: number | undefined;
        avg_time_saved_seconds?: number | undefined;
        success_rate?: number | undefined;
    } | undefined;
    confirmations?: number | undefined;
    confirming_agents?: string[] | undefined;
    confidence?: number | undefined;
    urgency?: "normal" | "high" | "critical" | undefined;
    tags?: string[] | undefined;
    expires_at?: string | undefined;
}>;
type Observation = z.infer<typeof Observation>;
declare const CreateObservation: z.ZodObject<{
    domain: z.ZodString;
    path: z.ZodOptional<z.ZodString>;
    category: z.ZodEnum<["behavior", "error", "auth", "rate_limit", "format"]>;
    summary: z.ZodString;
    structured_data: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
        element: z.ZodOptional<z.ZodString>;
        action: z.ZodOptional<z.ZodString>;
        expected_result: z.ZodOptional<z.ZodString>;
        actual_result: z.ZodOptional<z.ZodString>;
        workaround: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        element: z.ZodOptional<z.ZodString>;
        action: z.ZodOptional<z.ZodString>;
        expected_result: z.ZodOptional<z.ZodString>;
        actual_result: z.ZodOptional<z.ZodString>;
        workaround: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        element: z.ZodOptional<z.ZodString>;
        action: z.ZodOptional<z.ZodString>;
        expected_result: z.ZodOptional<z.ZodString>;
        actual_result: z.ZodOptional<z.ZodString>;
        workaround: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
        error_code: z.ZodOptional<z.ZodString>;
        error_message: z.ZodOptional<z.ZodString>;
        trigger: z.ZodOptional<z.ZodString>;
        resolution: z.ZodOptional<z.ZodString>;
        recoverable: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        error_code: z.ZodOptional<z.ZodString>;
        error_message: z.ZodOptional<z.ZodString>;
        trigger: z.ZodOptional<z.ZodString>;
        resolution: z.ZodOptional<z.ZodString>;
        recoverable: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        error_code: z.ZodOptional<z.ZodString>;
        error_message: z.ZodOptional<z.ZodString>;
        trigger: z.ZodOptional<z.ZodString>;
        resolution: z.ZodOptional<z.ZodString>;
        recoverable: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
        method: z.ZodOptional<z.ZodString>;
        header: z.ZodOptional<z.ZodString>;
        token_location: z.ZodOptional<z.ZodString>;
        session_duration: z.ZodOptional<z.ZodString>;
        refresh_mechanism: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        method: z.ZodOptional<z.ZodString>;
        header: z.ZodOptional<z.ZodString>;
        token_location: z.ZodOptional<z.ZodString>;
        session_duration: z.ZodOptional<z.ZodString>;
        refresh_mechanism: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        method: z.ZodOptional<z.ZodString>;
        header: z.ZodOptional<z.ZodString>;
        token_location: z.ZodOptional<z.ZodString>;
        session_duration: z.ZodOptional<z.ZodString>;
        refresh_mechanism: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
        limit: z.ZodOptional<z.ZodNumber>;
        window: z.ZodOptional<z.ZodString>;
        header_remaining: z.ZodOptional<z.ZodString>;
        header_reset: z.ZodOptional<z.ZodString>;
        retry_after: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        limit: z.ZodOptional<z.ZodNumber>;
        window: z.ZodOptional<z.ZodString>;
        header_remaining: z.ZodOptional<z.ZodString>;
        header_reset: z.ZodOptional<z.ZodString>;
        retry_after: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        limit: z.ZodOptional<z.ZodNumber>;
        window: z.ZodOptional<z.ZodString>;
        header_remaining: z.ZodOptional<z.ZodString>;
        header_reset: z.ZodOptional<z.ZodString>;
        retry_after: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
        field: z.ZodOptional<z.ZodString>;
        format: z.ZodOptional<z.ZodString>;
        validation_regex: z.ZodOptional<z.ZodString>;
        encoding: z.ZodOptional<z.ZodString>;
        max_length: z.ZodOptional<z.ZodNumber>;
        required: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        field: z.ZodOptional<z.ZodString>;
        format: z.ZodOptional<z.ZodString>;
        validation_regex: z.ZodOptional<z.ZodString>;
        encoding: z.ZodOptional<z.ZodString>;
        max_length: z.ZodOptional<z.ZodNumber>;
        required: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        field: z.ZodOptional<z.ZodString>;
        format: z.ZodOptional<z.ZodString>;
        validation_regex: z.ZodOptional<z.ZodString>;
        encoding: z.ZodOptional<z.ZodString>;
        max_length: z.ZodOptional<z.ZodNumber>;
        required: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>, z.ZodRecord<z.ZodString, z.ZodUnknown>]>>;
    impact_estimate: z.ZodOptional<z.ZodObject<{
        time_saved_seconds: z.ZodOptional<z.ZodNumber>;
        success_rate_improvement: z.ZodOptional<z.ZodNumber>;
        reasoning: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        time_saved_seconds?: number | undefined;
        success_rate_improvement?: number | undefined;
        reasoning?: string | undefined;
    }, {
        time_saved_seconds?: number | undefined;
        success_rate_improvement?: number | undefined;
        reasoning?: string | undefined;
    }>>;
    urgency: z.ZodOptional<z.ZodEnum<["normal", "high", "critical"]>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    expires_at: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    domain: string;
    category: "error" | "behavior" | "auth" | "rate_limit" | "format";
    summary: string;
    path?: string | undefined;
    structured_data?: Record<string, unknown> | z.objectOutputType<{
        element: z.ZodOptional<z.ZodString>;
        action: z.ZodOptional<z.ZodString>;
        expected_result: z.ZodOptional<z.ZodString>;
        actual_result: z.ZodOptional<z.ZodString>;
        workaround: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
        error_code: z.ZodOptional<z.ZodString>;
        error_message: z.ZodOptional<z.ZodString>;
        trigger: z.ZodOptional<z.ZodString>;
        resolution: z.ZodOptional<z.ZodString>;
        recoverable: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
        method: z.ZodOptional<z.ZodString>;
        header: z.ZodOptional<z.ZodString>;
        token_location: z.ZodOptional<z.ZodString>;
        session_duration: z.ZodOptional<z.ZodString>;
        refresh_mechanism: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
        limit: z.ZodOptional<z.ZodNumber>;
        window: z.ZodOptional<z.ZodString>;
        header_remaining: z.ZodOptional<z.ZodString>;
        header_reset: z.ZodOptional<z.ZodString>;
        retry_after: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
        field: z.ZodOptional<z.ZodString>;
        format: z.ZodOptional<z.ZodString>;
        validation_regex: z.ZodOptional<z.ZodString>;
        encoding: z.ZodOptional<z.ZodString>;
        max_length: z.ZodOptional<z.ZodNumber>;
        required: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    impact_estimate?: {
        time_saved_seconds?: number | undefined;
        success_rate_improvement?: number | undefined;
        reasoning?: string | undefined;
    } | undefined;
    urgency?: "normal" | "high" | "critical" | undefined;
    tags?: string[] | undefined;
    expires_at?: string | undefined;
}, {
    domain: string;
    category: "error" | "behavior" | "auth" | "rate_limit" | "format";
    summary: string;
    path?: string | undefined;
    structured_data?: Record<string, unknown> | z.objectInputType<{
        element: z.ZodOptional<z.ZodString>;
        action: z.ZodOptional<z.ZodString>;
        expected_result: z.ZodOptional<z.ZodString>;
        actual_result: z.ZodOptional<z.ZodString>;
        workaround: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
        error_code: z.ZodOptional<z.ZodString>;
        error_message: z.ZodOptional<z.ZodString>;
        trigger: z.ZodOptional<z.ZodString>;
        resolution: z.ZodOptional<z.ZodString>;
        recoverable: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
        method: z.ZodOptional<z.ZodString>;
        header: z.ZodOptional<z.ZodString>;
        token_location: z.ZodOptional<z.ZodString>;
        session_duration: z.ZodOptional<z.ZodString>;
        refresh_mechanism: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
        limit: z.ZodOptional<z.ZodNumber>;
        window: z.ZodOptional<z.ZodString>;
        header_remaining: z.ZodOptional<z.ZodString>;
        header_reset: z.ZodOptional<z.ZodString>;
        retry_after: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
        field: z.ZodOptional<z.ZodString>;
        format: z.ZodOptional<z.ZodString>;
        validation_regex: z.ZodOptional<z.ZodString>;
        encoding: z.ZodOptional<z.ZodString>;
        max_length: z.ZodOptional<z.ZodNumber>;
        required: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    impact_estimate?: {
        time_saved_seconds?: number | undefined;
        success_rate_improvement?: number | undefined;
        reasoning?: string | undefined;
    } | undefined;
    urgency?: "normal" | "high" | "critical" | undefined;
    tags?: string[] | undefined;
    expires_at?: string | undefined;
}>;
type CreateObservation = z.infer<typeof CreateObservation>;
declare const StoredObservation: z.ZodObject<{
    id: z.ZodString;
    agent_hash: z.ZodString;
    domain: z.ZodString;
    path: z.ZodOptional<z.ZodString>;
    category: z.ZodEnum<["behavior", "error", "auth", "rate_limit", "format"]>;
    summary: z.ZodString;
    structured_data: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
        element: z.ZodOptional<z.ZodString>;
        action: z.ZodOptional<z.ZodString>;
        expected_result: z.ZodOptional<z.ZodString>;
        actual_result: z.ZodOptional<z.ZodString>;
        workaround: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        element: z.ZodOptional<z.ZodString>;
        action: z.ZodOptional<z.ZodString>;
        expected_result: z.ZodOptional<z.ZodString>;
        actual_result: z.ZodOptional<z.ZodString>;
        workaround: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        element: z.ZodOptional<z.ZodString>;
        action: z.ZodOptional<z.ZodString>;
        expected_result: z.ZodOptional<z.ZodString>;
        actual_result: z.ZodOptional<z.ZodString>;
        workaround: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
        error_code: z.ZodOptional<z.ZodString>;
        error_message: z.ZodOptional<z.ZodString>;
        trigger: z.ZodOptional<z.ZodString>;
        resolution: z.ZodOptional<z.ZodString>;
        recoverable: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        error_code: z.ZodOptional<z.ZodString>;
        error_message: z.ZodOptional<z.ZodString>;
        trigger: z.ZodOptional<z.ZodString>;
        resolution: z.ZodOptional<z.ZodString>;
        recoverable: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        error_code: z.ZodOptional<z.ZodString>;
        error_message: z.ZodOptional<z.ZodString>;
        trigger: z.ZodOptional<z.ZodString>;
        resolution: z.ZodOptional<z.ZodString>;
        recoverable: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
        method: z.ZodOptional<z.ZodString>;
        header: z.ZodOptional<z.ZodString>;
        token_location: z.ZodOptional<z.ZodString>;
        session_duration: z.ZodOptional<z.ZodString>;
        refresh_mechanism: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        method: z.ZodOptional<z.ZodString>;
        header: z.ZodOptional<z.ZodString>;
        token_location: z.ZodOptional<z.ZodString>;
        session_duration: z.ZodOptional<z.ZodString>;
        refresh_mechanism: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        method: z.ZodOptional<z.ZodString>;
        header: z.ZodOptional<z.ZodString>;
        token_location: z.ZodOptional<z.ZodString>;
        session_duration: z.ZodOptional<z.ZodString>;
        refresh_mechanism: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
        limit: z.ZodOptional<z.ZodNumber>;
        window: z.ZodOptional<z.ZodString>;
        header_remaining: z.ZodOptional<z.ZodString>;
        header_reset: z.ZodOptional<z.ZodString>;
        retry_after: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        limit: z.ZodOptional<z.ZodNumber>;
        window: z.ZodOptional<z.ZodString>;
        header_remaining: z.ZodOptional<z.ZodString>;
        header_reset: z.ZodOptional<z.ZodString>;
        retry_after: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        limit: z.ZodOptional<z.ZodNumber>;
        window: z.ZodOptional<z.ZodString>;
        header_remaining: z.ZodOptional<z.ZodString>;
        header_reset: z.ZodOptional<z.ZodString>;
        retry_after: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
        field: z.ZodOptional<z.ZodString>;
        format: z.ZodOptional<z.ZodString>;
        validation_regex: z.ZodOptional<z.ZodString>;
        encoding: z.ZodOptional<z.ZodString>;
        max_length: z.ZodOptional<z.ZodNumber>;
        required: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        field: z.ZodOptional<z.ZodString>;
        format: z.ZodOptional<z.ZodString>;
        validation_regex: z.ZodOptional<z.ZodString>;
        encoding: z.ZodOptional<z.ZodString>;
        max_length: z.ZodOptional<z.ZodNumber>;
        required: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        field: z.ZodOptional<z.ZodString>;
        format: z.ZodOptional<z.ZodString>;
        validation_regex: z.ZodOptional<z.ZodString>;
        encoding: z.ZodOptional<z.ZodString>;
        max_length: z.ZodOptional<z.ZodNumber>;
        required: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>, z.ZodRecord<z.ZodString, z.ZodUnknown>]>>;
    impact_estimate: z.ZodOptional<z.ZodObject<{
        time_saved_seconds: z.ZodOptional<z.ZodNumber>;
        success_rate_improvement: z.ZodOptional<z.ZodNumber>;
        reasoning: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        time_saved_seconds?: number | undefined;
        success_rate_improvement?: number | undefined;
        reasoning?: string | undefined;
    }, {
        time_saved_seconds?: number | undefined;
        success_rate_improvement?: number | undefined;
        reasoning?: string | undefined;
    }>>;
    impact_reports: z.ZodDefault<z.ZodArray<z.ZodObject<{
        agent_hash: z.ZodString;
        actual_time_saved_seconds: z.ZodOptional<z.ZodNumber>;
        task_succeeded: z.ZodOptional<z.ZodBoolean>;
        helpful: z.ZodBoolean;
        feedback: z.ZodOptional<z.ZodString>;
        reported_at: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        agent_hash: string;
        helpful: boolean;
        reported_at: string;
        actual_time_saved_seconds?: number | undefined;
        task_succeeded?: boolean | undefined;
        feedback?: string | undefined;
    }, {
        agent_hash: string;
        helpful: boolean;
        reported_at: string;
        actual_time_saved_seconds?: number | undefined;
        task_succeeded?: boolean | undefined;
        feedback?: string | undefined;
    }>, "many">>;
    impact_stats: z.ZodOptional<z.ZodObject<{
        total_uses: z.ZodDefault<z.ZodNumber>;
        helpful_count: z.ZodDefault<z.ZodNumber>;
        avg_time_saved_seconds: z.ZodOptional<z.ZodNumber>;
        success_rate: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        total_uses: number;
        helpful_count: number;
        avg_time_saved_seconds?: number | undefined;
        success_rate?: number | undefined;
    }, {
        total_uses?: number | undefined;
        helpful_count?: number | undefined;
        avg_time_saved_seconds?: number | undefined;
        success_rate?: number | undefined;
    }>>;
    status: z.ZodDefault<z.ZodEnum<["pending", "confirmed", "contradicted", "stale"]>>;
    confirmations: z.ZodDefault<z.ZodNumber>;
    confirming_agents: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    confidence: z.ZodDefault<z.ZodNumber>;
    urgency: z.ZodDefault<z.ZodEnum<["normal", "high", "critical"]>>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
    expires_at: z.ZodOptional<z.ZodString>;
} & {
    vector_id: z.ZodOptional<z.ZodString>;
    content_hash: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "confirmed" | "contradicted" | "stale";
    id: string;
    agent_hash: string;
    domain: string;
    category: "error" | "behavior" | "auth" | "rate_limit" | "format";
    summary: string;
    impact_reports: {
        agent_hash: string;
        helpful: boolean;
        reported_at: string;
        actual_time_saved_seconds?: number | undefined;
        task_succeeded?: boolean | undefined;
        feedback?: string | undefined;
    }[];
    confirmations: number;
    confirming_agents: string[];
    confidence: number;
    urgency: "normal" | "high" | "critical";
    tags: string[];
    created_at: string;
    updated_at: string;
    content_hash: string;
    path?: string | undefined;
    structured_data?: Record<string, unknown> | z.objectOutputType<{
        element: z.ZodOptional<z.ZodString>;
        action: z.ZodOptional<z.ZodString>;
        expected_result: z.ZodOptional<z.ZodString>;
        actual_result: z.ZodOptional<z.ZodString>;
        workaround: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
        error_code: z.ZodOptional<z.ZodString>;
        error_message: z.ZodOptional<z.ZodString>;
        trigger: z.ZodOptional<z.ZodString>;
        resolution: z.ZodOptional<z.ZodString>;
        recoverable: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
        method: z.ZodOptional<z.ZodString>;
        header: z.ZodOptional<z.ZodString>;
        token_location: z.ZodOptional<z.ZodString>;
        session_duration: z.ZodOptional<z.ZodString>;
        refresh_mechanism: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
        limit: z.ZodOptional<z.ZodNumber>;
        window: z.ZodOptional<z.ZodString>;
        header_remaining: z.ZodOptional<z.ZodString>;
        header_reset: z.ZodOptional<z.ZodString>;
        retry_after: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
        field: z.ZodOptional<z.ZodString>;
        format: z.ZodOptional<z.ZodString>;
        validation_regex: z.ZodOptional<z.ZodString>;
        encoding: z.ZodOptional<z.ZodString>;
        max_length: z.ZodOptional<z.ZodNumber>;
        required: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    impact_estimate?: {
        time_saved_seconds?: number | undefined;
        success_rate_improvement?: number | undefined;
        reasoning?: string | undefined;
    } | undefined;
    impact_stats?: {
        total_uses: number;
        helpful_count: number;
        avg_time_saved_seconds?: number | undefined;
        success_rate?: number | undefined;
    } | undefined;
    expires_at?: string | undefined;
    vector_id?: string | undefined;
}, {
    id: string;
    agent_hash: string;
    domain: string;
    category: "error" | "behavior" | "auth" | "rate_limit" | "format";
    summary: string;
    created_at: string;
    updated_at: string;
    content_hash: string;
    path?: string | undefined;
    status?: "pending" | "confirmed" | "contradicted" | "stale" | undefined;
    structured_data?: Record<string, unknown> | z.objectInputType<{
        element: z.ZodOptional<z.ZodString>;
        action: z.ZodOptional<z.ZodString>;
        expected_result: z.ZodOptional<z.ZodString>;
        actual_result: z.ZodOptional<z.ZodString>;
        workaround: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
        error_code: z.ZodOptional<z.ZodString>;
        error_message: z.ZodOptional<z.ZodString>;
        trigger: z.ZodOptional<z.ZodString>;
        resolution: z.ZodOptional<z.ZodString>;
        recoverable: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
        method: z.ZodOptional<z.ZodString>;
        header: z.ZodOptional<z.ZodString>;
        token_location: z.ZodOptional<z.ZodString>;
        session_duration: z.ZodOptional<z.ZodString>;
        refresh_mechanism: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
        limit: z.ZodOptional<z.ZodNumber>;
        window: z.ZodOptional<z.ZodString>;
        header_remaining: z.ZodOptional<z.ZodString>;
        header_reset: z.ZodOptional<z.ZodString>;
        retry_after: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
        field: z.ZodOptional<z.ZodString>;
        format: z.ZodOptional<z.ZodString>;
        validation_regex: z.ZodOptional<z.ZodString>;
        encoding: z.ZodOptional<z.ZodString>;
        max_length: z.ZodOptional<z.ZodNumber>;
        required: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    impact_estimate?: {
        time_saved_seconds?: number | undefined;
        success_rate_improvement?: number | undefined;
        reasoning?: string | undefined;
    } | undefined;
    impact_reports?: {
        agent_hash: string;
        helpful: boolean;
        reported_at: string;
        actual_time_saved_seconds?: number | undefined;
        task_succeeded?: boolean | undefined;
        feedback?: string | undefined;
    }[] | undefined;
    impact_stats?: {
        total_uses?: number | undefined;
        helpful_count?: number | undefined;
        avg_time_saved_seconds?: number | undefined;
        success_rate?: number | undefined;
    } | undefined;
    confirmations?: number | undefined;
    confirming_agents?: string[] | undefined;
    confidence?: number | undefined;
    urgency?: "normal" | "high" | "critical" | undefined;
    tags?: string[] | undefined;
    expires_at?: string | undefined;
    vector_id?: string | undefined;
}>;
type StoredObservation = z.infer<typeof StoredObservation>;
declare const AggregationKey: z.ZodObject<{
    domain: z.ZodString;
    path: z.ZodOptional<z.ZodString>;
    category: z.ZodEnum<["behavior", "error", "auth", "rate_limit", "format"]>;
    content_hash: z.ZodString;
}, "strip", z.ZodTypeAny, {
    domain: string;
    category: "error" | "behavior" | "auth" | "rate_limit" | "format";
    content_hash: string;
    path?: string | undefined;
}, {
    domain: string;
    category: "error" | "behavior" | "auth" | "rate_limit" | "format";
    content_hash: string;
    path?: string | undefined;
}>;
type AggregationKey = z.infer<typeof AggregationKey>;

interface QueryOptions {
    domain?: string;
    path?: string;
    category?: ObservationCategory;
    status?: ObservationStatus;
    since?: string;
    limit?: number;
    offset?: number;
}
interface ConfirmationGroup {
    id: number;
    domain: string;
    path: string | null;
    category: string;
    content_hash: string;
    canonical_observation_id: string;
    total_confirmations: number;
    unique_agents: string[];
    status: ObservationStatus;
    confidence: number;
    created_at: string;
    updated_at: string;
}
interface DomainStats {
    domain: string;
    count: number;
}
interface ObservationStats {
    total_observations: number;
    observations_by_status: Record<string, number>;
    observations_by_category: Record<string, number>;
    domains_count: number;
    top_domains: DomainStats[];
}
declare class SQLiteStorage {
    private db;
    constructor(dbPath: string);
    insertObservation(observation: StoredObservation): void;
    getObservation(id: string): StoredObservation | null;
    updateObservation(id: string, updates: Partial<StoredObservation>): void;
    /**
     * Add an impact report to an observation and update aggregated stats
     */
    addImpactReport(id: string, report: {
        agent_hash: string;
        helpful: boolean;
        task_succeeded?: boolean;
        actual_time_saved_seconds?: number;
        feedback?: string;
    }): {
        success: boolean;
        updated_stats?: StoredObservation['impact_stats'];
    };
    queryObservations(options: QueryOptions): StoredObservation[];
    countObservations(options: QueryOptions): number;
    findConfirmationGroup(domain: string, path: string | undefined, category: string, contentHash: string): ConfirmationGroup | null;
    createConfirmationGroup(domain: string, path: string | undefined, category: string, contentHash: string, observationId: string, agentHash: string): ConfirmationGroup;
    updateConfirmationGroup(id: number, updates: Partial<Pick<ConfirmationGroup, 'total_confirmations' | 'unique_agents' | 'status' | 'confidence'>>): void;
    getStats(domain?: string): ObservationStats;
    getAllDomains(): DomainStats[];
    getFailures(options: {
        domain?: string;
        since?: string;
        limit?: number;
    }): StoredObservation[];
    getSyncState(peerName: string): {
        last_sync_at: string | null;
        last_observation_id: string | null;
        sync_count: number;
    } | null;
    updateSyncState(peerName: string, lastSyncAt: string, lastObservationId: string): void;
    private rowToObservation;
    private rowToConfirmationGroup;
    close(): void;
}

declare const PeerConfig: z.ZodObject<{
    name: z.ZodString;
    path: z.ZodString;
    enabled: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    path: string;
    enabled: boolean;
    name: string;
}, {
    path: string;
    name: string;
    enabled?: boolean | undefined;
}>;
type PeerConfig = z.infer<typeof PeerConfig>;
declare const QdrantConfig: z.ZodObject<{
    url: z.ZodDefault<z.ZodString>;
    collection_name: z.ZodDefault<z.ZodString>;
    api_key: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    url: string;
    collection_name: string;
    api_key?: string | undefined;
}, {
    url?: string | undefined;
    collection_name?: string | undefined;
    api_key?: string | undefined;
}>;
type QdrantConfig = z.infer<typeof QdrantConfig>;
declare const ConfirmationConfig: z.ZodObject<{
    threshold: z.ZodDefault<z.ZodNumber>;
    confidence_factor: z.ZodDefault<z.ZodNumber>;
    contradiction_window_hours: z.ZodDefault<z.ZodNumber>;
    stale_after_days: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    threshold: number;
    confidence_factor: number;
    contradiction_window_hours: number;
    stale_after_days: number;
}, {
    threshold?: number | undefined;
    confidence_factor?: number | undefined;
    contradiction_window_hours?: number | undefined;
    stale_after_days?: number | undefined;
}>;
type ConfirmationConfig = z.infer<typeof ConfirmationConfig>;
declare const SyncConfig: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodBoolean>;
    interval_ms: z.ZodDefault<z.ZodNumber>;
    urgent_interval_ms: z.ZodDefault<z.ZodNumber>;
    outbox_path: z.ZodString;
    peers: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        path: z.ZodString;
        enabled: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        enabled: boolean;
        name: string;
    }, {
        path: string;
        name: string;
        enabled?: boolean | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    interval_ms: number;
    urgent_interval_ms: number;
    outbox_path: string;
    peers: {
        path: string;
        enabled: boolean;
        name: string;
    }[];
}, {
    outbox_path: string;
    enabled?: boolean | undefined;
    interval_ms?: number | undefined;
    urgent_interval_ms?: number | undefined;
    peers?: {
        path: string;
        name: string;
        enabled?: boolean | undefined;
    }[] | undefined;
}>;
type SyncConfig = z.infer<typeof SyncConfig>;
declare const EmbeddingConfig: z.ZodObject<{
    model: z.ZodDefault<z.ZodString>;
    dimension: z.ZodDefault<z.ZodNumber>;
    batch_size: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    model: string;
    dimension: number;
    batch_size: number;
}, {
    model?: string | undefined;
    dimension?: number | undefined;
    batch_size?: number | undefined;
}>;
type EmbeddingConfig = z.infer<typeof EmbeddingConfig>;
declare const SubstrateConfig: z.ZodObject<{
    data_dir: z.ZodString;
    sqlite_path: z.ZodOptional<z.ZodString>;
    jsonl_path: z.ZodOptional<z.ZodString>;
    agent_id: z.ZodOptional<z.ZodString>;
    qdrant: z.ZodOptional<z.ZodObject<{
        url: z.ZodDefault<z.ZodString>;
        collection_name: z.ZodDefault<z.ZodString>;
        api_key: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        url: string;
        collection_name: string;
        api_key?: string | undefined;
    }, {
        url?: string | undefined;
        collection_name?: string | undefined;
        api_key?: string | undefined;
    }>>;
    confirmation: z.ZodOptional<z.ZodObject<{
        threshold: z.ZodDefault<z.ZodNumber>;
        confidence_factor: z.ZodDefault<z.ZodNumber>;
        contradiction_window_hours: z.ZodDefault<z.ZodNumber>;
        stale_after_days: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        threshold: number;
        confidence_factor: number;
        contradiction_window_hours: number;
        stale_after_days: number;
    }, {
        threshold?: number | undefined;
        confidence_factor?: number | undefined;
        contradiction_window_hours?: number | undefined;
        stale_after_days?: number | undefined;
    }>>;
    sync: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        interval_ms: z.ZodDefault<z.ZodNumber>;
        urgent_interval_ms: z.ZodDefault<z.ZodNumber>;
        outbox_path: z.ZodString;
        peers: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            path: z.ZodString;
            enabled: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            path: string;
            enabled: boolean;
            name: string;
        }, {
            path: string;
            name: string;
            enabled?: boolean | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        interval_ms: number;
        urgent_interval_ms: number;
        outbox_path: string;
        peers: {
            path: string;
            enabled: boolean;
            name: string;
        }[];
    }, {
        outbox_path: string;
        enabled?: boolean | undefined;
        interval_ms?: number | undefined;
        urgent_interval_ms?: number | undefined;
        peers?: {
            path: string;
            name: string;
            enabled?: boolean | undefined;
        }[] | undefined;
    }>>;
    embedding: z.ZodOptional<z.ZodObject<{
        model: z.ZodDefault<z.ZodString>;
        dimension: z.ZodDefault<z.ZodNumber>;
        batch_size: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        model: string;
        dimension: number;
        batch_size: number;
    }, {
        model?: string | undefined;
        dimension?: number | undefined;
        batch_size?: number | undefined;
    }>>;
    log_level: z.ZodDefault<z.ZodEnum<["debug", "info", "warn", "error"]>>;
}, "strip", z.ZodTypeAny, {
    data_dir: string;
    log_level: "debug" | "info" | "warn" | "error";
    sqlite_path?: string | undefined;
    jsonl_path?: string | undefined;
    agent_id?: string | undefined;
    qdrant?: {
        url: string;
        collection_name: string;
        api_key?: string | undefined;
    } | undefined;
    confirmation?: {
        threshold: number;
        confidence_factor: number;
        contradiction_window_hours: number;
        stale_after_days: number;
    } | undefined;
    sync?: {
        enabled: boolean;
        interval_ms: number;
        urgent_interval_ms: number;
        outbox_path: string;
        peers: {
            path: string;
            enabled: boolean;
            name: string;
        }[];
    } | undefined;
    embedding?: {
        model: string;
        dimension: number;
        batch_size: number;
    } | undefined;
}, {
    data_dir: string;
    sqlite_path?: string | undefined;
    jsonl_path?: string | undefined;
    agent_id?: string | undefined;
    qdrant?: {
        url?: string | undefined;
        collection_name?: string | undefined;
        api_key?: string | undefined;
    } | undefined;
    confirmation?: {
        threshold?: number | undefined;
        confidence_factor?: number | undefined;
        contradiction_window_hours?: number | undefined;
        stale_after_days?: number | undefined;
    } | undefined;
    sync?: {
        outbox_path: string;
        enabled?: boolean | undefined;
        interval_ms?: number | undefined;
        urgent_interval_ms?: number | undefined;
        peers?: {
            path: string;
            name: string;
            enabled?: boolean | undefined;
        }[] | undefined;
    } | undefined;
    embedding?: {
        model?: string | undefined;
        dimension?: number | undefined;
        batch_size?: number | undefined;
    } | undefined;
    log_level?: "debug" | "info" | "warn" | "error" | undefined;
}>;
type SubstrateConfig = z.infer<typeof SubstrateConfig>;
declare function createDefaultConfig(dataDir: string): SubstrateConfig;
declare function configFromEnv(baseConfig: SubstrateConfig): SubstrateConfig;

/**
 * Append-only JSONL log for observations
 * Provides durability and easy export/sync
 */
declare class JSONLStorage {
    private filePath;
    constructor(filePath: string);
    /**
     * Append an observation to the log
     */
    append(observation: StoredObservation): void;
    /**
     * Append multiple observations in a batch
     */
    appendBatch(observations: StoredObservation[]): void;
    /**
     * Read all observations from the log
     */
    readAll(): StoredObservation[];
    /**
     * Read observations since a specific ID
     * Used for incremental sync
     */
    readSince(sinceId: string | null): StoredObservation[];
    /**
     * Get the last observation in the log
     */
    getLastObservation(): StoredObservation | null;
    /**
     * Count observations in the log
     */
    count(): number;
    /**
     * Get the file path
     */
    getPath(): string;
}

interface StorageQueryOptions {
    domain?: string;
    path?: string;
    category?: ObservationCategory;
    status?: ObservationStatus;
    since?: string;
    limit?: number;
    offset?: number;
}
/**
 * Storage facade that coordinates SQLite (for queries) and JSONL (for durability)
 */
declare class Storage {
    private sqlite;
    private jsonl;
    constructor(config: SubstrateConfig);
    /**
     * Insert an observation into both storage backends
     */
    insert(observation: StoredObservation): void;
    /**
     * Get an observation by ID
     */
    get(id: string): StoredObservation | null;
    /**
     * Update an observation
     */
    update(id: string, updates: Partial<StoredObservation>): void;
    /**
     * Query observations with filters
     */
    query(options: StorageQueryOptions): StoredObservation[];
    /**
     * Count observations matching filters
     */
    count(options: StorageQueryOptions): number;
    /**
     * Get observation statistics
     */
    getStats(domain?: string): ObservationStats;
    /**
     * Get all domains with observation counts
     */
    getAllDomains(): DomainStats[];
    /**
     * Get failure observations
     */
    getFailures(options: {
        domain?: string;
        since?: string;
        limit?: number;
    }): {
        status: "pending" | "confirmed" | "contradicted" | "stale";
        id: string;
        agent_hash: string;
        domain: string;
        category: "error" | "behavior" | "auth" | "rate_limit" | "format";
        summary: string;
        impact_reports: {
            agent_hash: string;
            helpful: boolean;
            reported_at: string;
            actual_time_saved_seconds?: number | undefined;
            task_succeeded?: boolean | undefined;
            feedback?: string | undefined;
        }[];
        confirmations: number;
        confirming_agents: string[];
        confidence: number;
        urgency: "normal" | "high" | "critical";
        tags: string[];
        created_at: string;
        updated_at: string;
        content_hash: string;
        path?: string | undefined;
        structured_data?: Record<string, unknown> | zod.objectOutputType<{
            element: zod.ZodOptional<zod.ZodString>;
            action: zod.ZodOptional<zod.ZodString>;
            expected_result: zod.ZodOptional<zod.ZodString>;
            actual_result: zod.ZodOptional<zod.ZodString>;
            workaround: zod.ZodOptional<zod.ZodString>;
        }, zod.ZodTypeAny, "passthrough"> | zod.objectOutputType<{
            error_code: zod.ZodOptional<zod.ZodString>;
            error_message: zod.ZodOptional<zod.ZodString>;
            trigger: zod.ZodOptional<zod.ZodString>;
            resolution: zod.ZodOptional<zod.ZodString>;
            recoverable: zod.ZodOptional<zod.ZodBoolean>;
        }, zod.ZodTypeAny, "passthrough"> | zod.objectOutputType<{
            method: zod.ZodOptional<zod.ZodString>;
            header: zod.ZodOptional<zod.ZodString>;
            token_location: zod.ZodOptional<zod.ZodString>;
            session_duration: zod.ZodOptional<zod.ZodString>;
            refresh_mechanism: zod.ZodOptional<zod.ZodString>;
        }, zod.ZodTypeAny, "passthrough"> | zod.objectOutputType<{
            limit: zod.ZodOptional<zod.ZodNumber>;
            window: zod.ZodOptional<zod.ZodString>;
            header_remaining: zod.ZodOptional<zod.ZodString>;
            header_reset: zod.ZodOptional<zod.ZodString>;
            retry_after: zod.ZodOptional<zod.ZodString>;
        }, zod.ZodTypeAny, "passthrough"> | zod.objectOutputType<{
            field: zod.ZodOptional<zod.ZodString>;
            format: zod.ZodOptional<zod.ZodString>;
            validation_regex: zod.ZodOptional<zod.ZodString>;
            encoding: zod.ZodOptional<zod.ZodString>;
            max_length: zod.ZodOptional<zod.ZodNumber>;
            required: zod.ZodOptional<zod.ZodBoolean>;
        }, zod.ZodTypeAny, "passthrough"> | undefined;
        impact_estimate?: {
            time_saved_seconds?: number | undefined;
            success_rate_improvement?: number | undefined;
            reasoning?: string | undefined;
        } | undefined;
        impact_stats?: {
            total_uses: number;
            helpful_count: number;
            avg_time_saved_seconds?: number | undefined;
            success_rate?: number | undefined;
        } | undefined;
        expires_at?: string | undefined;
        vector_id?: string | undefined;
    }[];
    /**
     * Add an impact report to an observation
     */
    addImpactReport(id: string, report: {
        agent_hash: string;
        helpful: boolean;
        task_succeeded?: boolean;
        actual_time_saved_seconds?: number;
        feedback?: string;
    }): {
        success: boolean;
        updated_stats?: StoredObservation["impact_stats"];
    };
    /**
     * Find an existing confirmation group
     */
    findConfirmationGroup(domain: string, path: string | undefined, category: string, contentHash: string): ConfirmationGroup | null;
    /**
     * Create a new confirmation group
     */
    createConfirmationGroup(domain: string, path: string | undefined, category: string, contentHash: string, observationId: string, agentHash: string): ConfirmationGroup;
    /**
     * Update a confirmation group
     */
    updateConfirmationGroup(id: number, updates: {
        total_confirmations?: number;
        unique_agents?: string[];
        status?: ObservationStatus;
        confidence?: number;
    }): void;
    /**
     * Get sync state for a peer
     */
    getSyncState(peerName: string): {
        last_sync_at: string | null;
        last_observation_id: string | null;
        sync_count: number;
    } | null;
    /**
     * Update sync state for a peer
     */
    updateSyncState(peerName: string, lastSyncAt: string, lastObservationId: string): void;
    /**
     * Read observations from JSONL since a specific ID (for sync)
     */
    readJSONLSince(sinceId: string | null): StoredObservation[];
    /**
     * Close storage connections
     */
    close(): void;
}

interface VectorSearchResult {
    id: string;
    score: number;
    observation_id: string;
}
interface VectorSearchFilters {
    domain?: string;
    category?: ObservationCategory;
    status?: ObservationStatus;
    min_confidence?: number;
}
/**
 * Qdrant client wrapper for vector operations
 */
declare class QdrantStorage {
    private client;
    private collectionName;
    private dimension;
    private initialized;
    constructor(qdrantConfig: QdrantConfig, embeddingConfig: EmbeddingConfig);
    /**
     * Initialize the collection if it doesn't exist
     */
    initialize(): Promise<void>;
    /**
     * Check if Qdrant is available
     */
    isAvailable(): Promise<boolean>;
    /**
     * Insert or update a vector point
     */
    upsert(vectorId: string, embedding: number[], observation: StoredObservation): Promise<void>;
    /**
     * Batch upsert multiple vectors
     */
    upsertBatch(items: Array<{
        vectorId: string;
        embedding: number[];
        observation: StoredObservation;
    }>): Promise<void>;
    /**
     * Search for similar vectors with optional filters
     */
    search(queryEmbedding: number[], limit: number, filters?: VectorSearchFilters): Promise<VectorSearchResult[]>;
    /**
     * Delete a vector point
     */
    delete(vectorId: string): Promise<void>;
    /**
     * Get collection info
     */
    getCollectionInfo(): Promise<{
        points_count: number;
    } | null>;
    /**
     * Update payload for an existing point
     */
    updatePayload(vectorId: string, updates: Partial<{
        status: string;
        confidence: number;
    }>): Promise<void>;
}

/**
 * Embedding generator using Transformers.js
 */
declare class EmbeddingGenerator {
    private config;
    private initialized;
    constructor(config: EmbeddingConfig);
    /**
     * Initialize the embedding pipeline
     */
    initialize(): Promise<void>;
    /**
     * Generate embedding for a single text
     */
    embed(text: string): Promise<number[]>;
    /**
     * Generate embeddings for multiple texts in batch
     */
    embedBatch(texts: string[]): Promise<number[][]>;
    /**
     * Get the dimension of the embeddings
     */
    getDimension(): number;
    /**
     * Create searchable text from observation fields
     */
    static createSearchableText(domain: string, path: string | undefined, category: string, summary: string, structuredData?: Record<string, unknown>): string;
}

interface VectorSearchOptions extends VectorSearchFilters {
    limit?: number;
}
/**
 * Vector search facade coordinating embeddings and Qdrant
 */
declare class VectorSearch {
    private embeddings;
    private qdrant;
    private initialized;
    private available;
    constructor(config: SubstrateConfig);
    /**
     * Initialize vector search components
     */
    initialize(): Promise<boolean>;
    /**
     * Check if vector search is available
     */
    isAvailable(): boolean;
    /**
     * Index an observation for vector search
     * Returns the vector ID if successful
     */
    index(observation: StoredObservation): Promise<string | undefined>;
    /**
     * Index multiple observations in batch
     */
    indexBatch(observations: StoredObservation[]): Promise<Map<string, string>>;
    /**
     * Search for similar observations
     */
    search(query: string, options?: VectorSearchOptions): Promise<{
        results: VectorSearchResult[];
        embedding_time_ms: number;
        search_time_ms: number;
    }>;
    /**
     * Update vector payload (e.g., when observation status changes)
     */
    updatePayload(vectorId: string, updates: {
        status?: string;
        confidence?: number;
    }): Promise<void>;
    /**
     * Delete a vector
     */
    delete(vectorId: string): Promise<void>;
    /**
     * Get vector index statistics
     */
    getStats(): Promise<{
        points_count: number;
    } | null>;
}

interface AggregationResult {
    isNew: boolean;
    groupId: number;
    canonicalObservationId: string;
    totalConfirmations: number;
    uniqueAgentCount: number;
}
/**
 * Groups observations by their content for confirmation tracking
 */
declare class Aggregator {
    private storage;
    private config;
    constructor(storage: Storage, config: ConfirmationConfig);
    /**
     * Process a new observation and aggregate it with existing similar observations
     */
    aggregate(observation: StoredObservation): AggregationResult;
    /**
     * Get the content hash for an observation
     */
    getContentHash(observation: StoredObservation): string;
}

interface PromotionResult {
    promoted: boolean;
    newStatus: ObservationStatus;
    newConfidence: number;
    message: string;
}
/**
 * Handles promotion of observations based on confirmation counts
 */
declare class Promoter {
    private storage;
    private config;
    private vectorSearch;
    constructor(storage: Storage, config: ConfirmationConfig, vectorSearch?: VectorSearch);
    /**
     * Calculate confidence based on confirmation count
     * confidence = min(1.0, confirmations / (threshold * 2))
     */
    calculateConfidence(confirmations: number): number;
    /**
     * Check and promote observation based on confirmation count
     */
    checkAndPromote(groupId: number, uniqueAgentCount: number, canonicalObservationId: string): Promise<PromotionResult>;
    /**
     * Manually confirm an observation (admin action)
     */
    manualConfirm(observationId: string, reason?: string): Promise<PromotionResult>;
    /**
     * Mark an observation as stale
     */
    markStale(observationId: string, reason?: string): Promise<PromotionResult>;
    /**
     * Reject an observation (mark as contradicted)
     */
    reject(observationId: string, reason?: string): Promise<PromotionResult>;
}

interface ContradictionResult {
    hasContradiction: boolean;
    contradictingObservations: string[];
    message: string;
}
/**
 * Detects contradictions between observations
 */
declare class ContradictionDetector {
    private storage;
    private config;
    constructor(storage: Storage, config: ConfirmationConfig);
    /**
     * Check for contradictions with existing observations
     * Looks for observations with same domain/path/category but different structured_data
     */
    detectContradictions(observation: StoredObservation): ContradictionResult;
    /**
     * Mark observations as contradicted
     */
    markAsContradicted(observationIds: string[]): void;
    /**
     * Check if two structured data objects conflict
     */
    private dataConflicts;
}

interface FuzzyMatchResult {
    matched: boolean;
    matchedObservationId: string | null;
    similarity: number;
}
/**
 * v0.3: Fuzzy structural matching using vector similarity
 * Groups "similar enough" observations for confirmation
 */
declare class FuzzyMatcher {
    private vectorSearch;
    private similarityThreshold;
    constructor(vectorSearch: VectorSearch, similarityThreshold?: number);
    /**
     * Find a fuzzy match for an observation
     */
    findMatch(observation: StoredObservation): Promise<FuzzyMatchResult>;
    /**
     * Set the similarity threshold
     */
    setThreshold(threshold: number): void;
    /**
     * Get the current similarity threshold
     */
    getThreshold(): number;
}

interface ProcessObservationResult {
    aggregation: AggregationResult;
    promotion: PromotionResult;
    contradiction: ContradictionResult;
}
/**
 * N-confirmation engine that coordinates aggregation, promotion, and contradiction detection
 */
declare class ConfirmationEngine {
    private aggregator;
    private promoter;
    private contradictionDetector;
    private fuzzyMatcher;
    private config;
    constructor(storage: Storage, config: ConfirmationConfig, vectorSearch?: VectorSearch);
    /**
     * Process a new observation through the confirmation pipeline
     */
    processObservation(observation: StoredObservation): Promise<ProcessObservationResult>;
    /**
     * Manually confirm an observation (admin action)
     */
    manualConfirm(observationId: string, reason?: string): Promise<PromotionResult>;
    /**
     * Manually reject an observation
     */
    reject(observationId: string, reason?: string): Promise<PromotionResult>;
    /**
     * Mark an observation as stale
     */
    markStale(observationId: string, reason?: string): Promise<PromotionResult>;
    /**
     * Get content hash for an observation
     */
    getContentHash(observation: StoredObservation): string;
    /**
     * Get the confirmation threshold
     */
    getThreshold(): number;
    /**
     * Calculate confidence for a given confirmation count
     */
    calculateConfidence(confirmations: number): number;
    /**
     * v0.3: Find fuzzy matches for an observation
     */
    findFuzzyMatch(observation: StoredObservation): Promise<{
        matched: boolean;
        matchedId: string | null;
        similarity: number;
    }>;
}

interface SyncBatch {
    id: string;
    created_at: string;
    observations: StoredObservation[];
}
/**
 * File-based transport for peer sync
 */
declare class FileTransport {
    private outboxPath;
    constructor(outboxPath: string);
    /**
     * Write observations to outbox for other peers to pick up
     */
    writeToOutbox(observations: StoredObservation[]): string;
    /**
     * Read sync batches from a peer's outbox
     */
    readFromPeerOutbox(peerOutboxPath: string, afterBatchId?: string): SyncBatch[];
    /**
     * Get the latest batch ID from outbox
     */
    getLatestBatchId(): string | null;
    /**
     * Clean up old batches from outbox
     */
    cleanupOldBatches(maxAgeMs?: number): number;
    /**
     * Get outbox path
     */
    getOutboxPath(): string;
    private ensureDir;
}

/**
 * Fast-path for urgent signals (failures, critical issues)
 */
declare class UrgentSignalHandler {
    private transport;
    private pendingUrgent;
    private flushTimer;
    private urgentIntervalMs;
    constructor(transport: FileTransport, urgentIntervalMs?: number);
    /**
     * Check if an observation is urgent
     */
    isUrgent(observation: StoredObservation): boolean;
    /**
     * Queue an urgent observation for fast sync
     */
    queue(observation: StoredObservation): void;
    /**
     * Flush urgent observations immediately
     */
    flush(): string | null;
    /**
     * Get count of pending urgent observations
     */
    getPendingCount(): number;
    /**
     * Stop the urgent handler
     */
    stop(): void;
}

interface SyncResult {
    peer: string;
    batchesProcessed: number;
    observationsImported: number;
    lastBatchId: string | null;
}
/**
 * Sync coordinator for peer-to-peer observation sharing
 */
declare class SyncCoordinator {
    private storage;
    private transport;
    private urgentHandler;
    private confirmationEngine;
    private vectorSearch;
    private config;
    private syncTimer;
    private running;
    constructor(storage: Storage, config: SyncConfig, confirmationEngine?: ConfirmationEngine, vectorSearch?: VectorSearch);
    /**
     * Start the sync coordinator
     */
    start(): void;
    /**
     * Stop the sync coordinator
     */
    stop(): void;
    /**
     * Export an observation for sync
     */
    exportObservation(observation: StoredObservation): void;
    /**
     * Flush urgent observations immediately
     */
    flushUrgent(): string | null;
    /**
     * Run a sync cycle with all peers
     */
    syncWithPeers(): Promise<SyncResult[]>;
    /**
     * Sync with a specific peer
     */
    syncWithPeer(peer: PeerConfig): Promise<SyncResult>;
    /**
     * Import a sync batch
     */
    private importBatch;
    /**
     * Export pending observations to outbox
     */
    exportPendingObservations(): string | null;
    /**
     * Schedule the next sync cycle
     */
    private scheduleSyncCycle;
    /**
     * Get the outbox path
     */
    getOutboxPath(): string;
    /**
     * Check if sync is running
     */
    isRunning(): boolean;
    /**
     * Get peer configurations
     */
    getPeers(): PeerConfig[];
}

interface Logger {
    debug(message: string, ...args: unknown[]): void;
    info(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    error(message: string, ...args: unknown[]): void;
}

interface SubstrateContext {
    storage: Storage;
    vectorSearch: VectorSearch;
    confirmationEngine: ConfirmationEngine;
    syncCoordinator: SyncCoordinator;
    config: SubstrateConfig;
    logger: Logger;
    agentHash: string;
}
interface CreateServerOptions extends Partial<SubstrateConfig> {
    /** Defer vector search initialization for faster startup */
    defer_vector_search?: boolean;
}
interface CreateServerResult {
    server: McpServer;
    context: SubstrateContext;
    cleanup: () => void;
    /** Call this to initialize vector search if defer_vector_search was true */
    initializeVectorSearch?: () => Promise<boolean>;
}
/**
 * Create and configure the Substrate MCP server
 */
declare function createSubstrateServer(userConfig?: CreateServerOptions): Promise<CreateServerResult>;

declare const ObserveInput: z.ZodObject<{
    domain: z.ZodString;
    path: z.ZodOptional<z.ZodString>;
    category: z.ZodEnum<["behavior", "error", "auth", "rate_limit", "format"]>;
    summary: z.ZodString;
    structured_data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    impact_estimate: z.ZodOptional<z.ZodObject<{
        time_saved_seconds: z.ZodOptional<z.ZodNumber>;
        success_rate_improvement: z.ZodOptional<z.ZodNumber>;
        reasoning: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        time_saved_seconds?: number | undefined;
        success_rate_improvement?: number | undefined;
        reasoning?: string | undefined;
    }, {
        time_saved_seconds?: number | undefined;
        success_rate_improvement?: number | undefined;
        reasoning?: string | undefined;
    }>>;
    urgency: z.ZodOptional<z.ZodEnum<["normal", "high", "critical"]>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    domain: string;
    category: "error" | "behavior" | "auth" | "rate_limit" | "format";
    summary: string;
    path?: string | undefined;
    structured_data?: Record<string, unknown> | undefined;
    impact_estimate?: {
        time_saved_seconds?: number | undefined;
        success_rate_improvement?: number | undefined;
        reasoning?: string | undefined;
    } | undefined;
    urgency?: "normal" | "high" | "critical" | undefined;
    tags?: string[] | undefined;
}, {
    domain: string;
    category: "error" | "behavior" | "auth" | "rate_limit" | "format";
    summary: string;
    path?: string | undefined;
    structured_data?: Record<string, unknown> | undefined;
    impact_estimate?: {
        time_saved_seconds?: number | undefined;
        success_rate_improvement?: number | undefined;
        reasoning?: string | undefined;
    } | undefined;
    urgency?: "normal" | "high" | "critical" | undefined;
    tags?: string[] | undefined;
}>;
type ObserveInput = z.infer<typeof ObserveInput>;
declare const ObserveOutput: z.ZodObject<{
    success: z.ZodBoolean;
    observation_id: z.ZodOptional<z.ZodString>;
    message: z.ZodString;
    matched_existing: z.ZodOptional<z.ZodBoolean>;
    new_confirmation_count: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    message: string;
    success: boolean;
    observation_id?: string | undefined;
    matched_existing?: boolean | undefined;
    new_confirmation_count?: number | undefined;
}, {
    message: string;
    success: boolean;
    observation_id?: string | undefined;
    matched_existing?: boolean | undefined;
    new_confirmation_count?: number | undefined;
}>;
type ObserveOutput = z.infer<typeof ObserveOutput>;
declare const LookupInput: z.ZodObject<{
    domain: z.ZodString;
    path: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodEnum<["behavior", "error", "auth", "rate_limit", "format"]>>;
    status: z.ZodOptional<z.ZodEnum<["pending", "confirmed", "contradicted", "stale"]>>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    domain: string;
    path?: string | undefined;
    status?: "pending" | "confirmed" | "contradicted" | "stale" | undefined;
    category?: "error" | "behavior" | "auth" | "rate_limit" | "format" | undefined;
}, {
    domain: string;
    path?: string | undefined;
    status?: "pending" | "confirmed" | "contradicted" | "stale" | undefined;
    limit?: number | undefined;
    category?: "error" | "behavior" | "auth" | "rate_limit" | "format" | undefined;
}>;
type LookupInput = z.infer<typeof LookupInput>;
declare const LookupOutput: z.ZodObject<{
    observations: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        agent_hash: z.ZodString;
        domain: z.ZodString;
        path: z.ZodOptional<z.ZodString>;
        category: z.ZodEnum<["behavior", "error", "auth", "rate_limit", "format"]>;
        summary: z.ZodString;
        structured_data: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
            element: z.ZodOptional<z.ZodString>;
            action: z.ZodOptional<z.ZodString>;
            expected_result: z.ZodOptional<z.ZodString>;
            actual_result: z.ZodOptional<z.ZodString>;
            workaround: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            element: z.ZodOptional<z.ZodString>;
            action: z.ZodOptional<z.ZodString>;
            expected_result: z.ZodOptional<z.ZodString>;
            actual_result: z.ZodOptional<z.ZodString>;
            workaround: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            element: z.ZodOptional<z.ZodString>;
            action: z.ZodOptional<z.ZodString>;
            expected_result: z.ZodOptional<z.ZodString>;
            actual_result: z.ZodOptional<z.ZodString>;
            workaround: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
            error_code: z.ZodOptional<z.ZodString>;
            error_message: z.ZodOptional<z.ZodString>;
            trigger: z.ZodOptional<z.ZodString>;
            resolution: z.ZodOptional<z.ZodString>;
            recoverable: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            error_code: z.ZodOptional<z.ZodString>;
            error_message: z.ZodOptional<z.ZodString>;
            trigger: z.ZodOptional<z.ZodString>;
            resolution: z.ZodOptional<z.ZodString>;
            recoverable: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            error_code: z.ZodOptional<z.ZodString>;
            error_message: z.ZodOptional<z.ZodString>;
            trigger: z.ZodOptional<z.ZodString>;
            resolution: z.ZodOptional<z.ZodString>;
            recoverable: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
            method: z.ZodOptional<z.ZodString>;
            header: z.ZodOptional<z.ZodString>;
            token_location: z.ZodOptional<z.ZodString>;
            session_duration: z.ZodOptional<z.ZodString>;
            refresh_mechanism: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            method: z.ZodOptional<z.ZodString>;
            header: z.ZodOptional<z.ZodString>;
            token_location: z.ZodOptional<z.ZodString>;
            session_duration: z.ZodOptional<z.ZodString>;
            refresh_mechanism: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            method: z.ZodOptional<z.ZodString>;
            header: z.ZodOptional<z.ZodString>;
            token_location: z.ZodOptional<z.ZodString>;
            session_duration: z.ZodOptional<z.ZodString>;
            refresh_mechanism: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
            limit: z.ZodOptional<z.ZodNumber>;
            window: z.ZodOptional<z.ZodString>;
            header_remaining: z.ZodOptional<z.ZodString>;
            header_reset: z.ZodOptional<z.ZodString>;
            retry_after: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            limit: z.ZodOptional<z.ZodNumber>;
            window: z.ZodOptional<z.ZodString>;
            header_remaining: z.ZodOptional<z.ZodString>;
            header_reset: z.ZodOptional<z.ZodString>;
            retry_after: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            limit: z.ZodOptional<z.ZodNumber>;
            window: z.ZodOptional<z.ZodString>;
            header_remaining: z.ZodOptional<z.ZodString>;
            header_reset: z.ZodOptional<z.ZodString>;
            retry_after: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
            field: z.ZodOptional<z.ZodString>;
            format: z.ZodOptional<z.ZodString>;
            validation_regex: z.ZodOptional<z.ZodString>;
            encoding: z.ZodOptional<z.ZodString>;
            max_length: z.ZodOptional<z.ZodNumber>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            field: z.ZodOptional<z.ZodString>;
            format: z.ZodOptional<z.ZodString>;
            validation_regex: z.ZodOptional<z.ZodString>;
            encoding: z.ZodOptional<z.ZodString>;
            max_length: z.ZodOptional<z.ZodNumber>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            field: z.ZodOptional<z.ZodString>;
            format: z.ZodOptional<z.ZodString>;
            validation_regex: z.ZodOptional<z.ZodString>;
            encoding: z.ZodOptional<z.ZodString>;
            max_length: z.ZodOptional<z.ZodNumber>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, z.ZodRecord<z.ZodString, z.ZodUnknown>]>>;
        impact_estimate: z.ZodOptional<z.ZodObject<{
            time_saved_seconds: z.ZodOptional<z.ZodNumber>;
            success_rate_improvement: z.ZodOptional<z.ZodNumber>;
            reasoning: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            time_saved_seconds?: number | undefined;
            success_rate_improvement?: number | undefined;
            reasoning?: string | undefined;
        }, {
            time_saved_seconds?: number | undefined;
            success_rate_improvement?: number | undefined;
            reasoning?: string | undefined;
        }>>;
        impact_reports: z.ZodDefault<z.ZodArray<z.ZodObject<{
            agent_hash: z.ZodString;
            actual_time_saved_seconds: z.ZodOptional<z.ZodNumber>;
            task_succeeded: z.ZodOptional<z.ZodBoolean>;
            helpful: z.ZodBoolean;
            feedback: z.ZodOptional<z.ZodString>;
            reported_at: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            agent_hash: string;
            helpful: boolean;
            reported_at: string;
            actual_time_saved_seconds?: number | undefined;
            task_succeeded?: boolean | undefined;
            feedback?: string | undefined;
        }, {
            agent_hash: string;
            helpful: boolean;
            reported_at: string;
            actual_time_saved_seconds?: number | undefined;
            task_succeeded?: boolean | undefined;
            feedback?: string | undefined;
        }>, "many">>;
        impact_stats: z.ZodOptional<z.ZodObject<{
            total_uses: z.ZodDefault<z.ZodNumber>;
            helpful_count: z.ZodDefault<z.ZodNumber>;
            avg_time_saved_seconds: z.ZodOptional<z.ZodNumber>;
            success_rate: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            total_uses: number;
            helpful_count: number;
            avg_time_saved_seconds?: number | undefined;
            success_rate?: number | undefined;
        }, {
            total_uses?: number | undefined;
            helpful_count?: number | undefined;
            avg_time_saved_seconds?: number | undefined;
            success_rate?: number | undefined;
        }>>;
        status: z.ZodDefault<z.ZodEnum<["pending", "confirmed", "contradicted", "stale"]>>;
        confirmations: z.ZodDefault<z.ZodNumber>;
        confirming_agents: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        confidence: z.ZodDefault<z.ZodNumber>;
        urgency: z.ZodDefault<z.ZodEnum<["normal", "high", "critical"]>>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        created_at: z.ZodString;
        updated_at: z.ZodString;
        expires_at: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "pending" | "confirmed" | "contradicted" | "stale";
        id: string;
        agent_hash: string;
        domain: string;
        category: "error" | "behavior" | "auth" | "rate_limit" | "format";
        summary: string;
        impact_reports: {
            agent_hash: string;
            helpful: boolean;
            reported_at: string;
            actual_time_saved_seconds?: number | undefined;
            task_succeeded?: boolean | undefined;
            feedback?: string | undefined;
        }[];
        confirmations: number;
        confirming_agents: string[];
        confidence: number;
        urgency: "normal" | "high" | "critical";
        tags: string[];
        created_at: string;
        updated_at: string;
        path?: string | undefined;
        structured_data?: Record<string, unknown> | z.objectOutputType<{
            element: z.ZodOptional<z.ZodString>;
            action: z.ZodOptional<z.ZodString>;
            expected_result: z.ZodOptional<z.ZodString>;
            actual_result: z.ZodOptional<z.ZodString>;
            workaround: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
            error_code: z.ZodOptional<z.ZodString>;
            error_message: z.ZodOptional<z.ZodString>;
            trigger: z.ZodOptional<z.ZodString>;
            resolution: z.ZodOptional<z.ZodString>;
            recoverable: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
            method: z.ZodOptional<z.ZodString>;
            header: z.ZodOptional<z.ZodString>;
            token_location: z.ZodOptional<z.ZodString>;
            session_duration: z.ZodOptional<z.ZodString>;
            refresh_mechanism: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
            limit: z.ZodOptional<z.ZodNumber>;
            window: z.ZodOptional<z.ZodString>;
            header_remaining: z.ZodOptional<z.ZodString>;
            header_reset: z.ZodOptional<z.ZodString>;
            retry_after: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
            field: z.ZodOptional<z.ZodString>;
            format: z.ZodOptional<z.ZodString>;
            validation_regex: z.ZodOptional<z.ZodString>;
            encoding: z.ZodOptional<z.ZodString>;
            max_length: z.ZodOptional<z.ZodNumber>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        impact_estimate?: {
            time_saved_seconds?: number | undefined;
            success_rate_improvement?: number | undefined;
            reasoning?: string | undefined;
        } | undefined;
        impact_stats?: {
            total_uses: number;
            helpful_count: number;
            avg_time_saved_seconds?: number | undefined;
            success_rate?: number | undefined;
        } | undefined;
        expires_at?: string | undefined;
    }, {
        id: string;
        agent_hash: string;
        domain: string;
        category: "error" | "behavior" | "auth" | "rate_limit" | "format";
        summary: string;
        created_at: string;
        updated_at: string;
        path?: string | undefined;
        status?: "pending" | "confirmed" | "contradicted" | "stale" | undefined;
        structured_data?: Record<string, unknown> | z.objectInputType<{
            element: z.ZodOptional<z.ZodString>;
            action: z.ZodOptional<z.ZodString>;
            expected_result: z.ZodOptional<z.ZodString>;
            actual_result: z.ZodOptional<z.ZodString>;
            workaround: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
            error_code: z.ZodOptional<z.ZodString>;
            error_message: z.ZodOptional<z.ZodString>;
            trigger: z.ZodOptional<z.ZodString>;
            resolution: z.ZodOptional<z.ZodString>;
            recoverable: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
            method: z.ZodOptional<z.ZodString>;
            header: z.ZodOptional<z.ZodString>;
            token_location: z.ZodOptional<z.ZodString>;
            session_duration: z.ZodOptional<z.ZodString>;
            refresh_mechanism: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
            limit: z.ZodOptional<z.ZodNumber>;
            window: z.ZodOptional<z.ZodString>;
            header_remaining: z.ZodOptional<z.ZodString>;
            header_reset: z.ZodOptional<z.ZodString>;
            retry_after: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
            field: z.ZodOptional<z.ZodString>;
            format: z.ZodOptional<z.ZodString>;
            validation_regex: z.ZodOptional<z.ZodString>;
            encoding: z.ZodOptional<z.ZodString>;
            max_length: z.ZodOptional<z.ZodNumber>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        impact_estimate?: {
            time_saved_seconds?: number | undefined;
            success_rate_improvement?: number | undefined;
            reasoning?: string | undefined;
        } | undefined;
        impact_reports?: {
            agent_hash: string;
            helpful: boolean;
            reported_at: string;
            actual_time_saved_seconds?: number | undefined;
            task_succeeded?: boolean | undefined;
            feedback?: string | undefined;
        }[] | undefined;
        impact_stats?: {
            total_uses?: number | undefined;
            helpful_count?: number | undefined;
            avg_time_saved_seconds?: number | undefined;
            success_rate?: number | undefined;
        } | undefined;
        confirmations?: number | undefined;
        confirming_agents?: string[] | undefined;
        confidence?: number | undefined;
        urgency?: "normal" | "high" | "critical" | undefined;
        tags?: string[] | undefined;
        expires_at?: string | undefined;
    }>, "many">;
    total_count: z.ZodNumber;
    has_more: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    observations: {
        status: "pending" | "confirmed" | "contradicted" | "stale";
        id: string;
        agent_hash: string;
        domain: string;
        category: "error" | "behavior" | "auth" | "rate_limit" | "format";
        summary: string;
        impact_reports: {
            agent_hash: string;
            helpful: boolean;
            reported_at: string;
            actual_time_saved_seconds?: number | undefined;
            task_succeeded?: boolean | undefined;
            feedback?: string | undefined;
        }[];
        confirmations: number;
        confirming_agents: string[];
        confidence: number;
        urgency: "normal" | "high" | "critical";
        tags: string[];
        created_at: string;
        updated_at: string;
        path?: string | undefined;
        structured_data?: Record<string, unknown> | z.objectOutputType<{
            element: z.ZodOptional<z.ZodString>;
            action: z.ZodOptional<z.ZodString>;
            expected_result: z.ZodOptional<z.ZodString>;
            actual_result: z.ZodOptional<z.ZodString>;
            workaround: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
            error_code: z.ZodOptional<z.ZodString>;
            error_message: z.ZodOptional<z.ZodString>;
            trigger: z.ZodOptional<z.ZodString>;
            resolution: z.ZodOptional<z.ZodString>;
            recoverable: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
            method: z.ZodOptional<z.ZodString>;
            header: z.ZodOptional<z.ZodString>;
            token_location: z.ZodOptional<z.ZodString>;
            session_duration: z.ZodOptional<z.ZodString>;
            refresh_mechanism: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
            limit: z.ZodOptional<z.ZodNumber>;
            window: z.ZodOptional<z.ZodString>;
            header_remaining: z.ZodOptional<z.ZodString>;
            header_reset: z.ZodOptional<z.ZodString>;
            retry_after: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
            field: z.ZodOptional<z.ZodString>;
            format: z.ZodOptional<z.ZodString>;
            validation_regex: z.ZodOptional<z.ZodString>;
            encoding: z.ZodOptional<z.ZodString>;
            max_length: z.ZodOptional<z.ZodNumber>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        impact_estimate?: {
            time_saved_seconds?: number | undefined;
            success_rate_improvement?: number | undefined;
            reasoning?: string | undefined;
        } | undefined;
        impact_stats?: {
            total_uses: number;
            helpful_count: number;
            avg_time_saved_seconds?: number | undefined;
            success_rate?: number | undefined;
        } | undefined;
        expires_at?: string | undefined;
    }[];
    total_count: number;
    has_more: boolean;
}, {
    observations: {
        id: string;
        agent_hash: string;
        domain: string;
        category: "error" | "behavior" | "auth" | "rate_limit" | "format";
        summary: string;
        created_at: string;
        updated_at: string;
        path?: string | undefined;
        status?: "pending" | "confirmed" | "contradicted" | "stale" | undefined;
        structured_data?: Record<string, unknown> | z.objectInputType<{
            element: z.ZodOptional<z.ZodString>;
            action: z.ZodOptional<z.ZodString>;
            expected_result: z.ZodOptional<z.ZodString>;
            actual_result: z.ZodOptional<z.ZodString>;
            workaround: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
            error_code: z.ZodOptional<z.ZodString>;
            error_message: z.ZodOptional<z.ZodString>;
            trigger: z.ZodOptional<z.ZodString>;
            resolution: z.ZodOptional<z.ZodString>;
            recoverable: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
            method: z.ZodOptional<z.ZodString>;
            header: z.ZodOptional<z.ZodString>;
            token_location: z.ZodOptional<z.ZodString>;
            session_duration: z.ZodOptional<z.ZodString>;
            refresh_mechanism: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
            limit: z.ZodOptional<z.ZodNumber>;
            window: z.ZodOptional<z.ZodString>;
            header_remaining: z.ZodOptional<z.ZodString>;
            header_reset: z.ZodOptional<z.ZodString>;
            retry_after: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
            field: z.ZodOptional<z.ZodString>;
            format: z.ZodOptional<z.ZodString>;
            validation_regex: z.ZodOptional<z.ZodString>;
            encoding: z.ZodOptional<z.ZodString>;
            max_length: z.ZodOptional<z.ZodNumber>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        impact_estimate?: {
            time_saved_seconds?: number | undefined;
            success_rate_improvement?: number | undefined;
            reasoning?: string | undefined;
        } | undefined;
        impact_reports?: {
            agent_hash: string;
            helpful: boolean;
            reported_at: string;
            actual_time_saved_seconds?: number | undefined;
            task_succeeded?: boolean | undefined;
            feedback?: string | undefined;
        }[] | undefined;
        impact_stats?: {
            total_uses?: number | undefined;
            helpful_count?: number | undefined;
            avg_time_saved_seconds?: number | undefined;
            success_rate?: number | undefined;
        } | undefined;
        confirmations?: number | undefined;
        confirming_agents?: string[] | undefined;
        confidence?: number | undefined;
        urgency?: "normal" | "high" | "critical" | undefined;
        tags?: string[] | undefined;
        expires_at?: string | undefined;
    }[];
    total_count: number;
    has_more: boolean;
}>;
type LookupOutput = z.infer<typeof LookupOutput>;
declare const SearchInput: z.ZodObject<{
    query: z.ZodString;
    domain: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodEnum<["behavior", "error", "auth", "rate_limit", "format"]>>;
    status: z.ZodOptional<z.ZodEnum<["pending", "confirmed", "contradicted", "stale"]>>;
    min_confidence: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    query: string;
    status?: "pending" | "confirmed" | "contradicted" | "stale" | undefined;
    domain?: string | undefined;
    category?: "error" | "behavior" | "auth" | "rate_limit" | "format" | undefined;
    min_confidence?: number | undefined;
}, {
    query: string;
    status?: "pending" | "confirmed" | "contradicted" | "stale" | undefined;
    limit?: number | undefined;
    domain?: string | undefined;
    category?: "error" | "behavior" | "auth" | "rate_limit" | "format" | undefined;
    min_confidence?: number | undefined;
}>;
type SearchInput = z.infer<typeof SearchInput>;
declare const SearchResult: z.ZodObject<{
    id: z.ZodString;
    agent_hash: z.ZodString;
    domain: z.ZodString;
    path: z.ZodOptional<z.ZodString>;
    category: z.ZodEnum<["behavior", "error", "auth", "rate_limit", "format"]>;
    summary: z.ZodString;
    structured_data: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
        element: z.ZodOptional<z.ZodString>;
        action: z.ZodOptional<z.ZodString>;
        expected_result: z.ZodOptional<z.ZodString>;
        actual_result: z.ZodOptional<z.ZodString>;
        workaround: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        element: z.ZodOptional<z.ZodString>;
        action: z.ZodOptional<z.ZodString>;
        expected_result: z.ZodOptional<z.ZodString>;
        actual_result: z.ZodOptional<z.ZodString>;
        workaround: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        element: z.ZodOptional<z.ZodString>;
        action: z.ZodOptional<z.ZodString>;
        expected_result: z.ZodOptional<z.ZodString>;
        actual_result: z.ZodOptional<z.ZodString>;
        workaround: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
        error_code: z.ZodOptional<z.ZodString>;
        error_message: z.ZodOptional<z.ZodString>;
        trigger: z.ZodOptional<z.ZodString>;
        resolution: z.ZodOptional<z.ZodString>;
        recoverable: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        error_code: z.ZodOptional<z.ZodString>;
        error_message: z.ZodOptional<z.ZodString>;
        trigger: z.ZodOptional<z.ZodString>;
        resolution: z.ZodOptional<z.ZodString>;
        recoverable: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        error_code: z.ZodOptional<z.ZodString>;
        error_message: z.ZodOptional<z.ZodString>;
        trigger: z.ZodOptional<z.ZodString>;
        resolution: z.ZodOptional<z.ZodString>;
        recoverable: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
        method: z.ZodOptional<z.ZodString>;
        header: z.ZodOptional<z.ZodString>;
        token_location: z.ZodOptional<z.ZodString>;
        session_duration: z.ZodOptional<z.ZodString>;
        refresh_mechanism: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        method: z.ZodOptional<z.ZodString>;
        header: z.ZodOptional<z.ZodString>;
        token_location: z.ZodOptional<z.ZodString>;
        session_duration: z.ZodOptional<z.ZodString>;
        refresh_mechanism: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        method: z.ZodOptional<z.ZodString>;
        header: z.ZodOptional<z.ZodString>;
        token_location: z.ZodOptional<z.ZodString>;
        session_duration: z.ZodOptional<z.ZodString>;
        refresh_mechanism: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
        limit: z.ZodOptional<z.ZodNumber>;
        window: z.ZodOptional<z.ZodString>;
        header_remaining: z.ZodOptional<z.ZodString>;
        header_reset: z.ZodOptional<z.ZodString>;
        retry_after: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        limit: z.ZodOptional<z.ZodNumber>;
        window: z.ZodOptional<z.ZodString>;
        header_remaining: z.ZodOptional<z.ZodString>;
        header_reset: z.ZodOptional<z.ZodString>;
        retry_after: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        limit: z.ZodOptional<z.ZodNumber>;
        window: z.ZodOptional<z.ZodString>;
        header_remaining: z.ZodOptional<z.ZodString>;
        header_reset: z.ZodOptional<z.ZodString>;
        retry_after: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
        field: z.ZodOptional<z.ZodString>;
        format: z.ZodOptional<z.ZodString>;
        validation_regex: z.ZodOptional<z.ZodString>;
        encoding: z.ZodOptional<z.ZodString>;
        max_length: z.ZodOptional<z.ZodNumber>;
        required: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        field: z.ZodOptional<z.ZodString>;
        format: z.ZodOptional<z.ZodString>;
        validation_regex: z.ZodOptional<z.ZodString>;
        encoding: z.ZodOptional<z.ZodString>;
        max_length: z.ZodOptional<z.ZodNumber>;
        required: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        field: z.ZodOptional<z.ZodString>;
        format: z.ZodOptional<z.ZodString>;
        validation_regex: z.ZodOptional<z.ZodString>;
        encoding: z.ZodOptional<z.ZodString>;
        max_length: z.ZodOptional<z.ZodNumber>;
        required: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>, z.ZodRecord<z.ZodString, z.ZodUnknown>]>>;
    impact_estimate: z.ZodOptional<z.ZodObject<{
        time_saved_seconds: z.ZodOptional<z.ZodNumber>;
        success_rate_improvement: z.ZodOptional<z.ZodNumber>;
        reasoning: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        time_saved_seconds?: number | undefined;
        success_rate_improvement?: number | undefined;
        reasoning?: string | undefined;
    }, {
        time_saved_seconds?: number | undefined;
        success_rate_improvement?: number | undefined;
        reasoning?: string | undefined;
    }>>;
    impact_reports: z.ZodDefault<z.ZodArray<z.ZodObject<{
        agent_hash: z.ZodString;
        actual_time_saved_seconds: z.ZodOptional<z.ZodNumber>;
        task_succeeded: z.ZodOptional<z.ZodBoolean>;
        helpful: z.ZodBoolean;
        feedback: z.ZodOptional<z.ZodString>;
        reported_at: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        agent_hash: string;
        helpful: boolean;
        reported_at: string;
        actual_time_saved_seconds?: number | undefined;
        task_succeeded?: boolean | undefined;
        feedback?: string | undefined;
    }, {
        agent_hash: string;
        helpful: boolean;
        reported_at: string;
        actual_time_saved_seconds?: number | undefined;
        task_succeeded?: boolean | undefined;
        feedback?: string | undefined;
    }>, "many">>;
    impact_stats: z.ZodOptional<z.ZodObject<{
        total_uses: z.ZodDefault<z.ZodNumber>;
        helpful_count: z.ZodDefault<z.ZodNumber>;
        avg_time_saved_seconds: z.ZodOptional<z.ZodNumber>;
        success_rate: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        total_uses: number;
        helpful_count: number;
        avg_time_saved_seconds?: number | undefined;
        success_rate?: number | undefined;
    }, {
        total_uses?: number | undefined;
        helpful_count?: number | undefined;
        avg_time_saved_seconds?: number | undefined;
        success_rate?: number | undefined;
    }>>;
    status: z.ZodDefault<z.ZodEnum<["pending", "confirmed", "contradicted", "stale"]>>;
    confirmations: z.ZodDefault<z.ZodNumber>;
    confirming_agents: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    confidence: z.ZodDefault<z.ZodNumber>;
    urgency: z.ZodDefault<z.ZodEnum<["normal", "high", "critical"]>>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
    expires_at: z.ZodOptional<z.ZodString>;
} & {
    score: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "confirmed" | "contradicted" | "stale";
    id: string;
    agent_hash: string;
    domain: string;
    category: "error" | "behavior" | "auth" | "rate_limit" | "format";
    summary: string;
    impact_reports: {
        agent_hash: string;
        helpful: boolean;
        reported_at: string;
        actual_time_saved_seconds?: number | undefined;
        task_succeeded?: boolean | undefined;
        feedback?: string | undefined;
    }[];
    confirmations: number;
    confirming_agents: string[];
    confidence: number;
    urgency: "normal" | "high" | "critical";
    tags: string[];
    created_at: string;
    updated_at: string;
    score: number;
    path?: string | undefined;
    structured_data?: Record<string, unknown> | z.objectOutputType<{
        element: z.ZodOptional<z.ZodString>;
        action: z.ZodOptional<z.ZodString>;
        expected_result: z.ZodOptional<z.ZodString>;
        actual_result: z.ZodOptional<z.ZodString>;
        workaround: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
        error_code: z.ZodOptional<z.ZodString>;
        error_message: z.ZodOptional<z.ZodString>;
        trigger: z.ZodOptional<z.ZodString>;
        resolution: z.ZodOptional<z.ZodString>;
        recoverable: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
        method: z.ZodOptional<z.ZodString>;
        header: z.ZodOptional<z.ZodString>;
        token_location: z.ZodOptional<z.ZodString>;
        session_duration: z.ZodOptional<z.ZodString>;
        refresh_mechanism: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
        limit: z.ZodOptional<z.ZodNumber>;
        window: z.ZodOptional<z.ZodString>;
        header_remaining: z.ZodOptional<z.ZodString>;
        header_reset: z.ZodOptional<z.ZodString>;
        retry_after: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
        field: z.ZodOptional<z.ZodString>;
        format: z.ZodOptional<z.ZodString>;
        validation_regex: z.ZodOptional<z.ZodString>;
        encoding: z.ZodOptional<z.ZodString>;
        max_length: z.ZodOptional<z.ZodNumber>;
        required: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    impact_estimate?: {
        time_saved_seconds?: number | undefined;
        success_rate_improvement?: number | undefined;
        reasoning?: string | undefined;
    } | undefined;
    impact_stats?: {
        total_uses: number;
        helpful_count: number;
        avg_time_saved_seconds?: number | undefined;
        success_rate?: number | undefined;
    } | undefined;
    expires_at?: string | undefined;
}, {
    id: string;
    agent_hash: string;
    domain: string;
    category: "error" | "behavior" | "auth" | "rate_limit" | "format";
    summary: string;
    created_at: string;
    updated_at: string;
    score: number;
    path?: string | undefined;
    status?: "pending" | "confirmed" | "contradicted" | "stale" | undefined;
    structured_data?: Record<string, unknown> | z.objectInputType<{
        element: z.ZodOptional<z.ZodString>;
        action: z.ZodOptional<z.ZodString>;
        expected_result: z.ZodOptional<z.ZodString>;
        actual_result: z.ZodOptional<z.ZodString>;
        workaround: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
        error_code: z.ZodOptional<z.ZodString>;
        error_message: z.ZodOptional<z.ZodString>;
        trigger: z.ZodOptional<z.ZodString>;
        resolution: z.ZodOptional<z.ZodString>;
        recoverable: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
        method: z.ZodOptional<z.ZodString>;
        header: z.ZodOptional<z.ZodString>;
        token_location: z.ZodOptional<z.ZodString>;
        session_duration: z.ZodOptional<z.ZodString>;
        refresh_mechanism: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
        limit: z.ZodOptional<z.ZodNumber>;
        window: z.ZodOptional<z.ZodString>;
        header_remaining: z.ZodOptional<z.ZodString>;
        header_reset: z.ZodOptional<z.ZodString>;
        retry_after: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
        field: z.ZodOptional<z.ZodString>;
        format: z.ZodOptional<z.ZodString>;
        validation_regex: z.ZodOptional<z.ZodString>;
        encoding: z.ZodOptional<z.ZodString>;
        max_length: z.ZodOptional<z.ZodNumber>;
        required: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    impact_estimate?: {
        time_saved_seconds?: number | undefined;
        success_rate_improvement?: number | undefined;
        reasoning?: string | undefined;
    } | undefined;
    impact_reports?: {
        agent_hash: string;
        helpful: boolean;
        reported_at: string;
        actual_time_saved_seconds?: number | undefined;
        task_succeeded?: boolean | undefined;
        feedback?: string | undefined;
    }[] | undefined;
    impact_stats?: {
        total_uses?: number | undefined;
        helpful_count?: number | undefined;
        avg_time_saved_seconds?: number | undefined;
        success_rate?: number | undefined;
    } | undefined;
    confirmations?: number | undefined;
    confirming_agents?: string[] | undefined;
    confidence?: number | undefined;
    urgency?: "normal" | "high" | "critical" | undefined;
    tags?: string[] | undefined;
    expires_at?: string | undefined;
}>;
type SearchResult = z.infer<typeof SearchResult>;
declare const SearchOutput: z.ZodObject<{
    results: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        agent_hash: z.ZodString;
        domain: z.ZodString;
        path: z.ZodOptional<z.ZodString>;
        category: z.ZodEnum<["behavior", "error", "auth", "rate_limit", "format"]>;
        summary: z.ZodString;
        structured_data: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
            element: z.ZodOptional<z.ZodString>;
            action: z.ZodOptional<z.ZodString>;
            expected_result: z.ZodOptional<z.ZodString>;
            actual_result: z.ZodOptional<z.ZodString>;
            workaround: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            element: z.ZodOptional<z.ZodString>;
            action: z.ZodOptional<z.ZodString>;
            expected_result: z.ZodOptional<z.ZodString>;
            actual_result: z.ZodOptional<z.ZodString>;
            workaround: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            element: z.ZodOptional<z.ZodString>;
            action: z.ZodOptional<z.ZodString>;
            expected_result: z.ZodOptional<z.ZodString>;
            actual_result: z.ZodOptional<z.ZodString>;
            workaround: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
            error_code: z.ZodOptional<z.ZodString>;
            error_message: z.ZodOptional<z.ZodString>;
            trigger: z.ZodOptional<z.ZodString>;
            resolution: z.ZodOptional<z.ZodString>;
            recoverable: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            error_code: z.ZodOptional<z.ZodString>;
            error_message: z.ZodOptional<z.ZodString>;
            trigger: z.ZodOptional<z.ZodString>;
            resolution: z.ZodOptional<z.ZodString>;
            recoverable: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            error_code: z.ZodOptional<z.ZodString>;
            error_message: z.ZodOptional<z.ZodString>;
            trigger: z.ZodOptional<z.ZodString>;
            resolution: z.ZodOptional<z.ZodString>;
            recoverable: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
            method: z.ZodOptional<z.ZodString>;
            header: z.ZodOptional<z.ZodString>;
            token_location: z.ZodOptional<z.ZodString>;
            session_duration: z.ZodOptional<z.ZodString>;
            refresh_mechanism: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            method: z.ZodOptional<z.ZodString>;
            header: z.ZodOptional<z.ZodString>;
            token_location: z.ZodOptional<z.ZodString>;
            session_duration: z.ZodOptional<z.ZodString>;
            refresh_mechanism: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            method: z.ZodOptional<z.ZodString>;
            header: z.ZodOptional<z.ZodString>;
            token_location: z.ZodOptional<z.ZodString>;
            session_duration: z.ZodOptional<z.ZodString>;
            refresh_mechanism: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
            limit: z.ZodOptional<z.ZodNumber>;
            window: z.ZodOptional<z.ZodString>;
            header_remaining: z.ZodOptional<z.ZodString>;
            header_reset: z.ZodOptional<z.ZodString>;
            retry_after: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            limit: z.ZodOptional<z.ZodNumber>;
            window: z.ZodOptional<z.ZodString>;
            header_remaining: z.ZodOptional<z.ZodString>;
            header_reset: z.ZodOptional<z.ZodString>;
            retry_after: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            limit: z.ZodOptional<z.ZodNumber>;
            window: z.ZodOptional<z.ZodString>;
            header_remaining: z.ZodOptional<z.ZodString>;
            header_reset: z.ZodOptional<z.ZodString>;
            retry_after: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
            field: z.ZodOptional<z.ZodString>;
            format: z.ZodOptional<z.ZodString>;
            validation_regex: z.ZodOptional<z.ZodString>;
            encoding: z.ZodOptional<z.ZodString>;
            max_length: z.ZodOptional<z.ZodNumber>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            field: z.ZodOptional<z.ZodString>;
            format: z.ZodOptional<z.ZodString>;
            validation_regex: z.ZodOptional<z.ZodString>;
            encoding: z.ZodOptional<z.ZodString>;
            max_length: z.ZodOptional<z.ZodNumber>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            field: z.ZodOptional<z.ZodString>;
            format: z.ZodOptional<z.ZodString>;
            validation_regex: z.ZodOptional<z.ZodString>;
            encoding: z.ZodOptional<z.ZodString>;
            max_length: z.ZodOptional<z.ZodNumber>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, z.ZodRecord<z.ZodString, z.ZodUnknown>]>>;
        impact_estimate: z.ZodOptional<z.ZodObject<{
            time_saved_seconds: z.ZodOptional<z.ZodNumber>;
            success_rate_improvement: z.ZodOptional<z.ZodNumber>;
            reasoning: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            time_saved_seconds?: number | undefined;
            success_rate_improvement?: number | undefined;
            reasoning?: string | undefined;
        }, {
            time_saved_seconds?: number | undefined;
            success_rate_improvement?: number | undefined;
            reasoning?: string | undefined;
        }>>;
        impact_reports: z.ZodDefault<z.ZodArray<z.ZodObject<{
            agent_hash: z.ZodString;
            actual_time_saved_seconds: z.ZodOptional<z.ZodNumber>;
            task_succeeded: z.ZodOptional<z.ZodBoolean>;
            helpful: z.ZodBoolean;
            feedback: z.ZodOptional<z.ZodString>;
            reported_at: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            agent_hash: string;
            helpful: boolean;
            reported_at: string;
            actual_time_saved_seconds?: number | undefined;
            task_succeeded?: boolean | undefined;
            feedback?: string | undefined;
        }, {
            agent_hash: string;
            helpful: boolean;
            reported_at: string;
            actual_time_saved_seconds?: number | undefined;
            task_succeeded?: boolean | undefined;
            feedback?: string | undefined;
        }>, "many">>;
        impact_stats: z.ZodOptional<z.ZodObject<{
            total_uses: z.ZodDefault<z.ZodNumber>;
            helpful_count: z.ZodDefault<z.ZodNumber>;
            avg_time_saved_seconds: z.ZodOptional<z.ZodNumber>;
            success_rate: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            total_uses: number;
            helpful_count: number;
            avg_time_saved_seconds?: number | undefined;
            success_rate?: number | undefined;
        }, {
            total_uses?: number | undefined;
            helpful_count?: number | undefined;
            avg_time_saved_seconds?: number | undefined;
            success_rate?: number | undefined;
        }>>;
        status: z.ZodDefault<z.ZodEnum<["pending", "confirmed", "contradicted", "stale"]>>;
        confirmations: z.ZodDefault<z.ZodNumber>;
        confirming_agents: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        confidence: z.ZodDefault<z.ZodNumber>;
        urgency: z.ZodDefault<z.ZodEnum<["normal", "high", "critical"]>>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        created_at: z.ZodString;
        updated_at: z.ZodString;
        expires_at: z.ZodOptional<z.ZodString>;
    } & {
        score: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        status: "pending" | "confirmed" | "contradicted" | "stale";
        id: string;
        agent_hash: string;
        domain: string;
        category: "error" | "behavior" | "auth" | "rate_limit" | "format";
        summary: string;
        impact_reports: {
            agent_hash: string;
            helpful: boolean;
            reported_at: string;
            actual_time_saved_seconds?: number | undefined;
            task_succeeded?: boolean | undefined;
            feedback?: string | undefined;
        }[];
        confirmations: number;
        confirming_agents: string[];
        confidence: number;
        urgency: "normal" | "high" | "critical";
        tags: string[];
        created_at: string;
        updated_at: string;
        score: number;
        path?: string | undefined;
        structured_data?: Record<string, unknown> | z.objectOutputType<{
            element: z.ZodOptional<z.ZodString>;
            action: z.ZodOptional<z.ZodString>;
            expected_result: z.ZodOptional<z.ZodString>;
            actual_result: z.ZodOptional<z.ZodString>;
            workaround: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
            error_code: z.ZodOptional<z.ZodString>;
            error_message: z.ZodOptional<z.ZodString>;
            trigger: z.ZodOptional<z.ZodString>;
            resolution: z.ZodOptional<z.ZodString>;
            recoverable: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
            method: z.ZodOptional<z.ZodString>;
            header: z.ZodOptional<z.ZodString>;
            token_location: z.ZodOptional<z.ZodString>;
            session_duration: z.ZodOptional<z.ZodString>;
            refresh_mechanism: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
            limit: z.ZodOptional<z.ZodNumber>;
            window: z.ZodOptional<z.ZodString>;
            header_remaining: z.ZodOptional<z.ZodString>;
            header_reset: z.ZodOptional<z.ZodString>;
            retry_after: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
            field: z.ZodOptional<z.ZodString>;
            format: z.ZodOptional<z.ZodString>;
            validation_regex: z.ZodOptional<z.ZodString>;
            encoding: z.ZodOptional<z.ZodString>;
            max_length: z.ZodOptional<z.ZodNumber>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        impact_estimate?: {
            time_saved_seconds?: number | undefined;
            success_rate_improvement?: number | undefined;
            reasoning?: string | undefined;
        } | undefined;
        impact_stats?: {
            total_uses: number;
            helpful_count: number;
            avg_time_saved_seconds?: number | undefined;
            success_rate?: number | undefined;
        } | undefined;
        expires_at?: string | undefined;
    }, {
        id: string;
        agent_hash: string;
        domain: string;
        category: "error" | "behavior" | "auth" | "rate_limit" | "format";
        summary: string;
        created_at: string;
        updated_at: string;
        score: number;
        path?: string | undefined;
        status?: "pending" | "confirmed" | "contradicted" | "stale" | undefined;
        structured_data?: Record<string, unknown> | z.objectInputType<{
            element: z.ZodOptional<z.ZodString>;
            action: z.ZodOptional<z.ZodString>;
            expected_result: z.ZodOptional<z.ZodString>;
            actual_result: z.ZodOptional<z.ZodString>;
            workaround: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
            error_code: z.ZodOptional<z.ZodString>;
            error_message: z.ZodOptional<z.ZodString>;
            trigger: z.ZodOptional<z.ZodString>;
            resolution: z.ZodOptional<z.ZodString>;
            recoverable: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
            method: z.ZodOptional<z.ZodString>;
            header: z.ZodOptional<z.ZodString>;
            token_location: z.ZodOptional<z.ZodString>;
            session_duration: z.ZodOptional<z.ZodString>;
            refresh_mechanism: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
            limit: z.ZodOptional<z.ZodNumber>;
            window: z.ZodOptional<z.ZodString>;
            header_remaining: z.ZodOptional<z.ZodString>;
            header_reset: z.ZodOptional<z.ZodString>;
            retry_after: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
            field: z.ZodOptional<z.ZodString>;
            format: z.ZodOptional<z.ZodString>;
            validation_regex: z.ZodOptional<z.ZodString>;
            encoding: z.ZodOptional<z.ZodString>;
            max_length: z.ZodOptional<z.ZodNumber>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        impact_estimate?: {
            time_saved_seconds?: number | undefined;
            success_rate_improvement?: number | undefined;
            reasoning?: string | undefined;
        } | undefined;
        impact_reports?: {
            agent_hash: string;
            helpful: boolean;
            reported_at: string;
            actual_time_saved_seconds?: number | undefined;
            task_succeeded?: boolean | undefined;
            feedback?: string | undefined;
        }[] | undefined;
        impact_stats?: {
            total_uses?: number | undefined;
            helpful_count?: number | undefined;
            avg_time_saved_seconds?: number | undefined;
            success_rate?: number | undefined;
        } | undefined;
        confirmations?: number | undefined;
        confirming_agents?: string[] | undefined;
        confidence?: number | undefined;
        urgency?: "normal" | "high" | "critical" | undefined;
        tags?: string[] | undefined;
        expires_at?: string | undefined;
    }>, "many">;
    query_embedding_time_ms: z.ZodOptional<z.ZodNumber>;
    search_time_ms: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    results: {
        status: "pending" | "confirmed" | "contradicted" | "stale";
        id: string;
        agent_hash: string;
        domain: string;
        category: "error" | "behavior" | "auth" | "rate_limit" | "format";
        summary: string;
        impact_reports: {
            agent_hash: string;
            helpful: boolean;
            reported_at: string;
            actual_time_saved_seconds?: number | undefined;
            task_succeeded?: boolean | undefined;
            feedback?: string | undefined;
        }[];
        confirmations: number;
        confirming_agents: string[];
        confidence: number;
        urgency: "normal" | "high" | "critical";
        tags: string[];
        created_at: string;
        updated_at: string;
        score: number;
        path?: string | undefined;
        structured_data?: Record<string, unknown> | z.objectOutputType<{
            element: z.ZodOptional<z.ZodString>;
            action: z.ZodOptional<z.ZodString>;
            expected_result: z.ZodOptional<z.ZodString>;
            actual_result: z.ZodOptional<z.ZodString>;
            workaround: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
            error_code: z.ZodOptional<z.ZodString>;
            error_message: z.ZodOptional<z.ZodString>;
            trigger: z.ZodOptional<z.ZodString>;
            resolution: z.ZodOptional<z.ZodString>;
            recoverable: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
            method: z.ZodOptional<z.ZodString>;
            header: z.ZodOptional<z.ZodString>;
            token_location: z.ZodOptional<z.ZodString>;
            session_duration: z.ZodOptional<z.ZodString>;
            refresh_mechanism: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
            limit: z.ZodOptional<z.ZodNumber>;
            window: z.ZodOptional<z.ZodString>;
            header_remaining: z.ZodOptional<z.ZodString>;
            header_reset: z.ZodOptional<z.ZodString>;
            retry_after: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
            field: z.ZodOptional<z.ZodString>;
            format: z.ZodOptional<z.ZodString>;
            validation_regex: z.ZodOptional<z.ZodString>;
            encoding: z.ZodOptional<z.ZodString>;
            max_length: z.ZodOptional<z.ZodNumber>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        impact_estimate?: {
            time_saved_seconds?: number | undefined;
            success_rate_improvement?: number | undefined;
            reasoning?: string | undefined;
        } | undefined;
        impact_stats?: {
            total_uses: number;
            helpful_count: number;
            avg_time_saved_seconds?: number | undefined;
            success_rate?: number | undefined;
        } | undefined;
        expires_at?: string | undefined;
    }[];
    search_time_ms?: number | undefined;
    query_embedding_time_ms?: number | undefined;
}, {
    results: {
        id: string;
        agent_hash: string;
        domain: string;
        category: "error" | "behavior" | "auth" | "rate_limit" | "format";
        summary: string;
        created_at: string;
        updated_at: string;
        score: number;
        path?: string | undefined;
        status?: "pending" | "confirmed" | "contradicted" | "stale" | undefined;
        structured_data?: Record<string, unknown> | z.objectInputType<{
            element: z.ZodOptional<z.ZodString>;
            action: z.ZodOptional<z.ZodString>;
            expected_result: z.ZodOptional<z.ZodString>;
            actual_result: z.ZodOptional<z.ZodString>;
            workaround: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
            error_code: z.ZodOptional<z.ZodString>;
            error_message: z.ZodOptional<z.ZodString>;
            trigger: z.ZodOptional<z.ZodString>;
            resolution: z.ZodOptional<z.ZodString>;
            recoverable: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
            method: z.ZodOptional<z.ZodString>;
            header: z.ZodOptional<z.ZodString>;
            token_location: z.ZodOptional<z.ZodString>;
            session_duration: z.ZodOptional<z.ZodString>;
            refresh_mechanism: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
            limit: z.ZodOptional<z.ZodNumber>;
            window: z.ZodOptional<z.ZodString>;
            header_remaining: z.ZodOptional<z.ZodString>;
            header_reset: z.ZodOptional<z.ZodString>;
            retry_after: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
            field: z.ZodOptional<z.ZodString>;
            format: z.ZodOptional<z.ZodString>;
            validation_regex: z.ZodOptional<z.ZodString>;
            encoding: z.ZodOptional<z.ZodString>;
            max_length: z.ZodOptional<z.ZodNumber>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        impact_estimate?: {
            time_saved_seconds?: number | undefined;
            success_rate_improvement?: number | undefined;
            reasoning?: string | undefined;
        } | undefined;
        impact_reports?: {
            agent_hash: string;
            helpful: boolean;
            reported_at: string;
            actual_time_saved_seconds?: number | undefined;
            task_succeeded?: boolean | undefined;
            feedback?: string | undefined;
        }[] | undefined;
        impact_stats?: {
            total_uses?: number | undefined;
            helpful_count?: number | undefined;
            avg_time_saved_seconds?: number | undefined;
            success_rate?: number | undefined;
        } | undefined;
        confirmations?: number | undefined;
        confirming_agents?: string[] | undefined;
        confidence?: number | undefined;
        urgency?: "normal" | "high" | "critical" | undefined;
        tags?: string[] | undefined;
        expires_at?: string | undefined;
    }[];
    search_time_ms?: number | undefined;
    query_embedding_time_ms?: number | undefined;
}>;
type SearchOutput = z.infer<typeof SearchOutput>;
declare const FailuresInput: z.ZodObject<{
    domain: z.ZodOptional<z.ZodString>;
    since: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    domain?: string | undefined;
    since?: string | undefined;
}, {
    limit?: number | undefined;
    domain?: string | undefined;
    since?: string | undefined;
}>;
type FailuresInput = z.infer<typeof FailuresInput>;
declare const FailuresOutput: z.ZodObject<{
    failures: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        agent_hash: z.ZodString;
        domain: z.ZodString;
        path: z.ZodOptional<z.ZodString>;
        category: z.ZodEnum<["behavior", "error", "auth", "rate_limit", "format"]>;
        summary: z.ZodString;
        structured_data: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
            element: z.ZodOptional<z.ZodString>;
            action: z.ZodOptional<z.ZodString>;
            expected_result: z.ZodOptional<z.ZodString>;
            actual_result: z.ZodOptional<z.ZodString>;
            workaround: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            element: z.ZodOptional<z.ZodString>;
            action: z.ZodOptional<z.ZodString>;
            expected_result: z.ZodOptional<z.ZodString>;
            actual_result: z.ZodOptional<z.ZodString>;
            workaround: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            element: z.ZodOptional<z.ZodString>;
            action: z.ZodOptional<z.ZodString>;
            expected_result: z.ZodOptional<z.ZodString>;
            actual_result: z.ZodOptional<z.ZodString>;
            workaround: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
            error_code: z.ZodOptional<z.ZodString>;
            error_message: z.ZodOptional<z.ZodString>;
            trigger: z.ZodOptional<z.ZodString>;
            resolution: z.ZodOptional<z.ZodString>;
            recoverable: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            error_code: z.ZodOptional<z.ZodString>;
            error_message: z.ZodOptional<z.ZodString>;
            trigger: z.ZodOptional<z.ZodString>;
            resolution: z.ZodOptional<z.ZodString>;
            recoverable: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            error_code: z.ZodOptional<z.ZodString>;
            error_message: z.ZodOptional<z.ZodString>;
            trigger: z.ZodOptional<z.ZodString>;
            resolution: z.ZodOptional<z.ZodString>;
            recoverable: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
            method: z.ZodOptional<z.ZodString>;
            header: z.ZodOptional<z.ZodString>;
            token_location: z.ZodOptional<z.ZodString>;
            session_duration: z.ZodOptional<z.ZodString>;
            refresh_mechanism: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            method: z.ZodOptional<z.ZodString>;
            header: z.ZodOptional<z.ZodString>;
            token_location: z.ZodOptional<z.ZodString>;
            session_duration: z.ZodOptional<z.ZodString>;
            refresh_mechanism: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            method: z.ZodOptional<z.ZodString>;
            header: z.ZodOptional<z.ZodString>;
            token_location: z.ZodOptional<z.ZodString>;
            session_duration: z.ZodOptional<z.ZodString>;
            refresh_mechanism: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
            limit: z.ZodOptional<z.ZodNumber>;
            window: z.ZodOptional<z.ZodString>;
            header_remaining: z.ZodOptional<z.ZodString>;
            header_reset: z.ZodOptional<z.ZodString>;
            retry_after: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            limit: z.ZodOptional<z.ZodNumber>;
            window: z.ZodOptional<z.ZodString>;
            header_remaining: z.ZodOptional<z.ZodString>;
            header_reset: z.ZodOptional<z.ZodString>;
            retry_after: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            limit: z.ZodOptional<z.ZodNumber>;
            window: z.ZodOptional<z.ZodString>;
            header_remaining: z.ZodOptional<z.ZodString>;
            header_reset: z.ZodOptional<z.ZodString>;
            retry_after: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
            field: z.ZodOptional<z.ZodString>;
            format: z.ZodOptional<z.ZodString>;
            validation_regex: z.ZodOptional<z.ZodString>;
            encoding: z.ZodOptional<z.ZodString>;
            max_length: z.ZodOptional<z.ZodNumber>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            field: z.ZodOptional<z.ZodString>;
            format: z.ZodOptional<z.ZodString>;
            validation_regex: z.ZodOptional<z.ZodString>;
            encoding: z.ZodOptional<z.ZodString>;
            max_length: z.ZodOptional<z.ZodNumber>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            field: z.ZodOptional<z.ZodString>;
            format: z.ZodOptional<z.ZodString>;
            validation_regex: z.ZodOptional<z.ZodString>;
            encoding: z.ZodOptional<z.ZodString>;
            max_length: z.ZodOptional<z.ZodNumber>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, z.ZodRecord<z.ZodString, z.ZodUnknown>]>>;
        impact_estimate: z.ZodOptional<z.ZodObject<{
            time_saved_seconds: z.ZodOptional<z.ZodNumber>;
            success_rate_improvement: z.ZodOptional<z.ZodNumber>;
            reasoning: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            time_saved_seconds?: number | undefined;
            success_rate_improvement?: number | undefined;
            reasoning?: string | undefined;
        }, {
            time_saved_seconds?: number | undefined;
            success_rate_improvement?: number | undefined;
            reasoning?: string | undefined;
        }>>;
        impact_reports: z.ZodDefault<z.ZodArray<z.ZodObject<{
            agent_hash: z.ZodString;
            actual_time_saved_seconds: z.ZodOptional<z.ZodNumber>;
            task_succeeded: z.ZodOptional<z.ZodBoolean>;
            helpful: z.ZodBoolean;
            feedback: z.ZodOptional<z.ZodString>;
            reported_at: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            agent_hash: string;
            helpful: boolean;
            reported_at: string;
            actual_time_saved_seconds?: number | undefined;
            task_succeeded?: boolean | undefined;
            feedback?: string | undefined;
        }, {
            agent_hash: string;
            helpful: boolean;
            reported_at: string;
            actual_time_saved_seconds?: number | undefined;
            task_succeeded?: boolean | undefined;
            feedback?: string | undefined;
        }>, "many">>;
        impact_stats: z.ZodOptional<z.ZodObject<{
            total_uses: z.ZodDefault<z.ZodNumber>;
            helpful_count: z.ZodDefault<z.ZodNumber>;
            avg_time_saved_seconds: z.ZodOptional<z.ZodNumber>;
            success_rate: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            total_uses: number;
            helpful_count: number;
            avg_time_saved_seconds?: number | undefined;
            success_rate?: number | undefined;
        }, {
            total_uses?: number | undefined;
            helpful_count?: number | undefined;
            avg_time_saved_seconds?: number | undefined;
            success_rate?: number | undefined;
        }>>;
        status: z.ZodDefault<z.ZodEnum<["pending", "confirmed", "contradicted", "stale"]>>;
        confirmations: z.ZodDefault<z.ZodNumber>;
        confirming_agents: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        confidence: z.ZodDefault<z.ZodNumber>;
        urgency: z.ZodDefault<z.ZodEnum<["normal", "high", "critical"]>>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        created_at: z.ZodString;
        updated_at: z.ZodString;
        expires_at: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "pending" | "confirmed" | "contradicted" | "stale";
        id: string;
        agent_hash: string;
        domain: string;
        category: "error" | "behavior" | "auth" | "rate_limit" | "format";
        summary: string;
        impact_reports: {
            agent_hash: string;
            helpful: boolean;
            reported_at: string;
            actual_time_saved_seconds?: number | undefined;
            task_succeeded?: boolean | undefined;
            feedback?: string | undefined;
        }[];
        confirmations: number;
        confirming_agents: string[];
        confidence: number;
        urgency: "normal" | "high" | "critical";
        tags: string[];
        created_at: string;
        updated_at: string;
        path?: string | undefined;
        structured_data?: Record<string, unknown> | z.objectOutputType<{
            element: z.ZodOptional<z.ZodString>;
            action: z.ZodOptional<z.ZodString>;
            expected_result: z.ZodOptional<z.ZodString>;
            actual_result: z.ZodOptional<z.ZodString>;
            workaround: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
            error_code: z.ZodOptional<z.ZodString>;
            error_message: z.ZodOptional<z.ZodString>;
            trigger: z.ZodOptional<z.ZodString>;
            resolution: z.ZodOptional<z.ZodString>;
            recoverable: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
            method: z.ZodOptional<z.ZodString>;
            header: z.ZodOptional<z.ZodString>;
            token_location: z.ZodOptional<z.ZodString>;
            session_duration: z.ZodOptional<z.ZodString>;
            refresh_mechanism: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
            limit: z.ZodOptional<z.ZodNumber>;
            window: z.ZodOptional<z.ZodString>;
            header_remaining: z.ZodOptional<z.ZodString>;
            header_reset: z.ZodOptional<z.ZodString>;
            retry_after: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
            field: z.ZodOptional<z.ZodString>;
            format: z.ZodOptional<z.ZodString>;
            validation_regex: z.ZodOptional<z.ZodString>;
            encoding: z.ZodOptional<z.ZodString>;
            max_length: z.ZodOptional<z.ZodNumber>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        impact_estimate?: {
            time_saved_seconds?: number | undefined;
            success_rate_improvement?: number | undefined;
            reasoning?: string | undefined;
        } | undefined;
        impact_stats?: {
            total_uses: number;
            helpful_count: number;
            avg_time_saved_seconds?: number | undefined;
            success_rate?: number | undefined;
        } | undefined;
        expires_at?: string | undefined;
    }, {
        id: string;
        agent_hash: string;
        domain: string;
        category: "error" | "behavior" | "auth" | "rate_limit" | "format";
        summary: string;
        created_at: string;
        updated_at: string;
        path?: string | undefined;
        status?: "pending" | "confirmed" | "contradicted" | "stale" | undefined;
        structured_data?: Record<string, unknown> | z.objectInputType<{
            element: z.ZodOptional<z.ZodString>;
            action: z.ZodOptional<z.ZodString>;
            expected_result: z.ZodOptional<z.ZodString>;
            actual_result: z.ZodOptional<z.ZodString>;
            workaround: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
            error_code: z.ZodOptional<z.ZodString>;
            error_message: z.ZodOptional<z.ZodString>;
            trigger: z.ZodOptional<z.ZodString>;
            resolution: z.ZodOptional<z.ZodString>;
            recoverable: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
            method: z.ZodOptional<z.ZodString>;
            header: z.ZodOptional<z.ZodString>;
            token_location: z.ZodOptional<z.ZodString>;
            session_duration: z.ZodOptional<z.ZodString>;
            refresh_mechanism: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
            limit: z.ZodOptional<z.ZodNumber>;
            window: z.ZodOptional<z.ZodString>;
            header_remaining: z.ZodOptional<z.ZodString>;
            header_reset: z.ZodOptional<z.ZodString>;
            retry_after: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
            field: z.ZodOptional<z.ZodString>;
            format: z.ZodOptional<z.ZodString>;
            validation_regex: z.ZodOptional<z.ZodString>;
            encoding: z.ZodOptional<z.ZodString>;
            max_length: z.ZodOptional<z.ZodNumber>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        impact_estimate?: {
            time_saved_seconds?: number | undefined;
            success_rate_improvement?: number | undefined;
            reasoning?: string | undefined;
        } | undefined;
        impact_reports?: {
            agent_hash: string;
            helpful: boolean;
            reported_at: string;
            actual_time_saved_seconds?: number | undefined;
            task_succeeded?: boolean | undefined;
            feedback?: string | undefined;
        }[] | undefined;
        impact_stats?: {
            total_uses?: number | undefined;
            helpful_count?: number | undefined;
            avg_time_saved_seconds?: number | undefined;
            success_rate?: number | undefined;
        } | undefined;
        confirmations?: number | undefined;
        confirming_agents?: string[] | undefined;
        confidence?: number | undefined;
        urgency?: "normal" | "high" | "critical" | undefined;
        tags?: string[] | undefined;
        expires_at?: string | undefined;
    }>, "many">;
    total_count: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    total_count: number;
    failures: {
        status: "pending" | "confirmed" | "contradicted" | "stale";
        id: string;
        agent_hash: string;
        domain: string;
        category: "error" | "behavior" | "auth" | "rate_limit" | "format";
        summary: string;
        impact_reports: {
            agent_hash: string;
            helpful: boolean;
            reported_at: string;
            actual_time_saved_seconds?: number | undefined;
            task_succeeded?: boolean | undefined;
            feedback?: string | undefined;
        }[];
        confirmations: number;
        confirming_agents: string[];
        confidence: number;
        urgency: "normal" | "high" | "critical";
        tags: string[];
        created_at: string;
        updated_at: string;
        path?: string | undefined;
        structured_data?: Record<string, unknown> | z.objectOutputType<{
            element: z.ZodOptional<z.ZodString>;
            action: z.ZodOptional<z.ZodString>;
            expected_result: z.ZodOptional<z.ZodString>;
            actual_result: z.ZodOptional<z.ZodString>;
            workaround: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
            error_code: z.ZodOptional<z.ZodString>;
            error_message: z.ZodOptional<z.ZodString>;
            trigger: z.ZodOptional<z.ZodString>;
            resolution: z.ZodOptional<z.ZodString>;
            recoverable: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
            method: z.ZodOptional<z.ZodString>;
            header: z.ZodOptional<z.ZodString>;
            token_location: z.ZodOptional<z.ZodString>;
            session_duration: z.ZodOptional<z.ZodString>;
            refresh_mechanism: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
            limit: z.ZodOptional<z.ZodNumber>;
            window: z.ZodOptional<z.ZodString>;
            header_remaining: z.ZodOptional<z.ZodString>;
            header_reset: z.ZodOptional<z.ZodString>;
            retry_after: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
            field: z.ZodOptional<z.ZodString>;
            format: z.ZodOptional<z.ZodString>;
            validation_regex: z.ZodOptional<z.ZodString>;
            encoding: z.ZodOptional<z.ZodString>;
            max_length: z.ZodOptional<z.ZodNumber>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        impact_estimate?: {
            time_saved_seconds?: number | undefined;
            success_rate_improvement?: number | undefined;
            reasoning?: string | undefined;
        } | undefined;
        impact_stats?: {
            total_uses: number;
            helpful_count: number;
            avg_time_saved_seconds?: number | undefined;
            success_rate?: number | undefined;
        } | undefined;
        expires_at?: string | undefined;
    }[];
}, {
    total_count: number;
    failures: {
        id: string;
        agent_hash: string;
        domain: string;
        category: "error" | "behavior" | "auth" | "rate_limit" | "format";
        summary: string;
        created_at: string;
        updated_at: string;
        path?: string | undefined;
        status?: "pending" | "confirmed" | "contradicted" | "stale" | undefined;
        structured_data?: Record<string, unknown> | z.objectInputType<{
            element: z.ZodOptional<z.ZodString>;
            action: z.ZodOptional<z.ZodString>;
            expected_result: z.ZodOptional<z.ZodString>;
            actual_result: z.ZodOptional<z.ZodString>;
            workaround: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
            error_code: z.ZodOptional<z.ZodString>;
            error_message: z.ZodOptional<z.ZodString>;
            trigger: z.ZodOptional<z.ZodString>;
            resolution: z.ZodOptional<z.ZodString>;
            recoverable: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
            method: z.ZodOptional<z.ZodString>;
            header: z.ZodOptional<z.ZodString>;
            token_location: z.ZodOptional<z.ZodString>;
            session_duration: z.ZodOptional<z.ZodString>;
            refresh_mechanism: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
            limit: z.ZodOptional<z.ZodNumber>;
            window: z.ZodOptional<z.ZodString>;
            header_remaining: z.ZodOptional<z.ZodString>;
            header_reset: z.ZodOptional<z.ZodString>;
            retry_after: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
            field: z.ZodOptional<z.ZodString>;
            format: z.ZodOptional<z.ZodString>;
            validation_regex: z.ZodOptional<z.ZodString>;
            encoding: z.ZodOptional<z.ZodString>;
            max_length: z.ZodOptional<z.ZodNumber>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        impact_estimate?: {
            time_saved_seconds?: number | undefined;
            success_rate_improvement?: number | undefined;
            reasoning?: string | undefined;
        } | undefined;
        impact_reports?: {
            agent_hash: string;
            helpful: boolean;
            reported_at: string;
            actual_time_saved_seconds?: number | undefined;
            task_succeeded?: boolean | undefined;
            feedback?: string | undefined;
        }[] | undefined;
        impact_stats?: {
            total_uses?: number | undefined;
            helpful_count?: number | undefined;
            avg_time_saved_seconds?: number | undefined;
            success_rate?: number | undefined;
        } | undefined;
        confirmations?: number | undefined;
        confirming_agents?: string[] | undefined;
        confidence?: number | undefined;
        urgency?: "normal" | "high" | "critical" | undefined;
        tags?: string[] | undefined;
        expires_at?: string | undefined;
    }[];
}>;
type FailuresOutput = z.infer<typeof FailuresOutput>;
declare const ConfirmInput: z.ZodObject<{
    observation_id: z.ZodString;
    action: z.ZodEnum<["confirm", "reject", "mark_stale"]>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    action: "confirm" | "reject" | "mark_stale";
    observation_id: string;
    reason?: string | undefined;
}, {
    action: "confirm" | "reject" | "mark_stale";
    observation_id: string;
    reason?: string | undefined;
}>;
type ConfirmInput = z.infer<typeof ConfirmInput>;
declare const ConfirmOutput: z.ZodObject<{
    success: z.ZodBoolean;
    observation_id: z.ZodString;
    new_status: z.ZodEnum<["pending", "confirmed", "contradicted", "stale"]>;
    new_confidence: z.ZodNumber;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    observation_id: string;
    success: boolean;
    new_status: "pending" | "confirmed" | "contradicted" | "stale";
    new_confidence: number;
}, {
    message: string;
    observation_id: string;
    success: boolean;
    new_status: "pending" | "confirmed" | "contradicted" | "stale";
    new_confidence: number;
}>;
type ConfirmOutput = z.infer<typeof ConfirmOutput>;
declare const StatsInput: z.ZodObject<{
    domain: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    domain?: string | undefined;
}, {
    domain?: string | undefined;
}>;
type StatsInput = z.infer<typeof StatsInput>;
declare const StatsOutput: z.ZodObject<{
    total_observations: z.ZodNumber;
    observations_by_status: z.ZodRecord<z.ZodString, z.ZodNumber>;
    observations_by_category: z.ZodRecord<z.ZodString, z.ZodNumber>;
    domains_count: z.ZodNumber;
    top_domains: z.ZodArray<z.ZodObject<{
        domain: z.ZodString;
        count: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        domain: string;
        count: number;
    }, {
        domain: string;
        count: number;
    }>, "many">;
    confirmations: z.ZodObject<{
        pending: z.ZodNumber;
        confirmed: z.ZodNumber;
        contradicted: z.ZodNumber;
        stale: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        pending: number;
        confirmed: number;
        contradicted: number;
        stale: number;
    }, {
        pending: number;
        confirmed: number;
        contradicted: number;
        stale: number;
    }>;
    vector_index_size: z.ZodOptional<z.ZodNumber>;
    last_sync: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    confirmations: {
        pending: number;
        confirmed: number;
        contradicted: number;
        stale: number;
    };
    total_observations: number;
    observations_by_status: Record<string, number>;
    observations_by_category: Record<string, number>;
    domains_count: number;
    top_domains: {
        domain: string;
        count: number;
    }[];
    vector_index_size?: number | undefined;
    last_sync?: string | undefined;
}, {
    confirmations: {
        pending: number;
        confirmed: number;
        contradicted: number;
        stale: number;
    };
    total_observations: number;
    observations_by_status: Record<string, number>;
    observations_by_category: Record<string, number>;
    domains_count: number;
    top_domains: {
        domain: string;
        count: number;
    }[];
    vector_index_size?: number | undefined;
    last_sync?: string | undefined;
}>;
type StatsOutput = z.infer<typeof StatsOutput>;
declare const SemanticSearchInput: z.ZodObject<{
    query: z.ZodString;
    domain: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodEnum<["behavior", "error", "auth", "rate_limit", "format"]>>;
    status: z.ZodOptional<z.ZodEnum<["pending", "confirmed", "contradicted", "stale"]>>;
    min_confidence: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    query: string;
    status?: "pending" | "confirmed" | "contradicted" | "stale" | undefined;
    domain?: string | undefined;
    category?: "error" | "behavior" | "auth" | "rate_limit" | "format" | undefined;
    min_confidence?: number | undefined;
}, {
    query: string;
    status?: "pending" | "confirmed" | "contradicted" | "stale" | undefined;
    limit?: number | undefined;
    domain?: string | undefined;
    category?: "error" | "behavior" | "auth" | "rate_limit" | "format" | undefined;
    min_confidence?: number | undefined;
}>;
type SemanticSearchInput = SearchInput;
declare const SemanticSearchOutput: z.ZodObject<{
    results: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        agent_hash: z.ZodString;
        domain: z.ZodString;
        path: z.ZodOptional<z.ZodString>;
        category: z.ZodEnum<["behavior", "error", "auth", "rate_limit", "format"]>;
        summary: z.ZodString;
        structured_data: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
            element: z.ZodOptional<z.ZodString>;
            action: z.ZodOptional<z.ZodString>;
            expected_result: z.ZodOptional<z.ZodString>;
            actual_result: z.ZodOptional<z.ZodString>;
            workaround: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            element: z.ZodOptional<z.ZodString>;
            action: z.ZodOptional<z.ZodString>;
            expected_result: z.ZodOptional<z.ZodString>;
            actual_result: z.ZodOptional<z.ZodString>;
            workaround: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            element: z.ZodOptional<z.ZodString>;
            action: z.ZodOptional<z.ZodString>;
            expected_result: z.ZodOptional<z.ZodString>;
            actual_result: z.ZodOptional<z.ZodString>;
            workaround: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
            error_code: z.ZodOptional<z.ZodString>;
            error_message: z.ZodOptional<z.ZodString>;
            trigger: z.ZodOptional<z.ZodString>;
            resolution: z.ZodOptional<z.ZodString>;
            recoverable: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            error_code: z.ZodOptional<z.ZodString>;
            error_message: z.ZodOptional<z.ZodString>;
            trigger: z.ZodOptional<z.ZodString>;
            resolution: z.ZodOptional<z.ZodString>;
            recoverable: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            error_code: z.ZodOptional<z.ZodString>;
            error_message: z.ZodOptional<z.ZodString>;
            trigger: z.ZodOptional<z.ZodString>;
            resolution: z.ZodOptional<z.ZodString>;
            recoverable: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
            method: z.ZodOptional<z.ZodString>;
            header: z.ZodOptional<z.ZodString>;
            token_location: z.ZodOptional<z.ZodString>;
            session_duration: z.ZodOptional<z.ZodString>;
            refresh_mechanism: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            method: z.ZodOptional<z.ZodString>;
            header: z.ZodOptional<z.ZodString>;
            token_location: z.ZodOptional<z.ZodString>;
            session_duration: z.ZodOptional<z.ZodString>;
            refresh_mechanism: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            method: z.ZodOptional<z.ZodString>;
            header: z.ZodOptional<z.ZodString>;
            token_location: z.ZodOptional<z.ZodString>;
            session_duration: z.ZodOptional<z.ZodString>;
            refresh_mechanism: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
            limit: z.ZodOptional<z.ZodNumber>;
            window: z.ZodOptional<z.ZodString>;
            header_remaining: z.ZodOptional<z.ZodString>;
            header_reset: z.ZodOptional<z.ZodString>;
            retry_after: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            limit: z.ZodOptional<z.ZodNumber>;
            window: z.ZodOptional<z.ZodString>;
            header_remaining: z.ZodOptional<z.ZodString>;
            header_reset: z.ZodOptional<z.ZodString>;
            retry_after: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            limit: z.ZodOptional<z.ZodNumber>;
            window: z.ZodOptional<z.ZodString>;
            header_remaining: z.ZodOptional<z.ZodString>;
            header_reset: z.ZodOptional<z.ZodString>;
            retry_after: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, z.ZodObject<{
            field: z.ZodOptional<z.ZodString>;
            format: z.ZodOptional<z.ZodString>;
            validation_regex: z.ZodOptional<z.ZodString>;
            encoding: z.ZodOptional<z.ZodString>;
            max_length: z.ZodOptional<z.ZodNumber>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            field: z.ZodOptional<z.ZodString>;
            format: z.ZodOptional<z.ZodString>;
            validation_regex: z.ZodOptional<z.ZodString>;
            encoding: z.ZodOptional<z.ZodString>;
            max_length: z.ZodOptional<z.ZodNumber>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            field: z.ZodOptional<z.ZodString>;
            format: z.ZodOptional<z.ZodString>;
            validation_regex: z.ZodOptional<z.ZodString>;
            encoding: z.ZodOptional<z.ZodString>;
            max_length: z.ZodOptional<z.ZodNumber>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>, z.ZodRecord<z.ZodString, z.ZodUnknown>]>>;
        impact_estimate: z.ZodOptional<z.ZodObject<{
            time_saved_seconds: z.ZodOptional<z.ZodNumber>;
            success_rate_improvement: z.ZodOptional<z.ZodNumber>;
            reasoning: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            time_saved_seconds?: number | undefined;
            success_rate_improvement?: number | undefined;
            reasoning?: string | undefined;
        }, {
            time_saved_seconds?: number | undefined;
            success_rate_improvement?: number | undefined;
            reasoning?: string | undefined;
        }>>;
        impact_reports: z.ZodDefault<z.ZodArray<z.ZodObject<{
            agent_hash: z.ZodString;
            actual_time_saved_seconds: z.ZodOptional<z.ZodNumber>;
            task_succeeded: z.ZodOptional<z.ZodBoolean>;
            helpful: z.ZodBoolean;
            feedback: z.ZodOptional<z.ZodString>;
            reported_at: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            agent_hash: string;
            helpful: boolean;
            reported_at: string;
            actual_time_saved_seconds?: number | undefined;
            task_succeeded?: boolean | undefined;
            feedback?: string | undefined;
        }, {
            agent_hash: string;
            helpful: boolean;
            reported_at: string;
            actual_time_saved_seconds?: number | undefined;
            task_succeeded?: boolean | undefined;
            feedback?: string | undefined;
        }>, "many">>;
        impact_stats: z.ZodOptional<z.ZodObject<{
            total_uses: z.ZodDefault<z.ZodNumber>;
            helpful_count: z.ZodDefault<z.ZodNumber>;
            avg_time_saved_seconds: z.ZodOptional<z.ZodNumber>;
            success_rate: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            total_uses: number;
            helpful_count: number;
            avg_time_saved_seconds?: number | undefined;
            success_rate?: number | undefined;
        }, {
            total_uses?: number | undefined;
            helpful_count?: number | undefined;
            avg_time_saved_seconds?: number | undefined;
            success_rate?: number | undefined;
        }>>;
        status: z.ZodDefault<z.ZodEnum<["pending", "confirmed", "contradicted", "stale"]>>;
        confirmations: z.ZodDefault<z.ZodNumber>;
        confirming_agents: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        confidence: z.ZodDefault<z.ZodNumber>;
        urgency: z.ZodDefault<z.ZodEnum<["normal", "high", "critical"]>>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        created_at: z.ZodString;
        updated_at: z.ZodString;
        expires_at: z.ZodOptional<z.ZodString>;
    } & {
        score: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        status: "pending" | "confirmed" | "contradicted" | "stale";
        id: string;
        agent_hash: string;
        domain: string;
        category: "error" | "behavior" | "auth" | "rate_limit" | "format";
        summary: string;
        impact_reports: {
            agent_hash: string;
            helpful: boolean;
            reported_at: string;
            actual_time_saved_seconds?: number | undefined;
            task_succeeded?: boolean | undefined;
            feedback?: string | undefined;
        }[];
        confirmations: number;
        confirming_agents: string[];
        confidence: number;
        urgency: "normal" | "high" | "critical";
        tags: string[];
        created_at: string;
        updated_at: string;
        score: number;
        path?: string | undefined;
        structured_data?: Record<string, unknown> | z.objectOutputType<{
            element: z.ZodOptional<z.ZodString>;
            action: z.ZodOptional<z.ZodString>;
            expected_result: z.ZodOptional<z.ZodString>;
            actual_result: z.ZodOptional<z.ZodString>;
            workaround: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
            error_code: z.ZodOptional<z.ZodString>;
            error_message: z.ZodOptional<z.ZodString>;
            trigger: z.ZodOptional<z.ZodString>;
            resolution: z.ZodOptional<z.ZodString>;
            recoverable: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
            method: z.ZodOptional<z.ZodString>;
            header: z.ZodOptional<z.ZodString>;
            token_location: z.ZodOptional<z.ZodString>;
            session_duration: z.ZodOptional<z.ZodString>;
            refresh_mechanism: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
            limit: z.ZodOptional<z.ZodNumber>;
            window: z.ZodOptional<z.ZodString>;
            header_remaining: z.ZodOptional<z.ZodString>;
            header_reset: z.ZodOptional<z.ZodString>;
            retry_after: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
            field: z.ZodOptional<z.ZodString>;
            format: z.ZodOptional<z.ZodString>;
            validation_regex: z.ZodOptional<z.ZodString>;
            encoding: z.ZodOptional<z.ZodString>;
            max_length: z.ZodOptional<z.ZodNumber>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        impact_estimate?: {
            time_saved_seconds?: number | undefined;
            success_rate_improvement?: number | undefined;
            reasoning?: string | undefined;
        } | undefined;
        impact_stats?: {
            total_uses: number;
            helpful_count: number;
            avg_time_saved_seconds?: number | undefined;
            success_rate?: number | undefined;
        } | undefined;
        expires_at?: string | undefined;
    }, {
        id: string;
        agent_hash: string;
        domain: string;
        category: "error" | "behavior" | "auth" | "rate_limit" | "format";
        summary: string;
        created_at: string;
        updated_at: string;
        score: number;
        path?: string | undefined;
        status?: "pending" | "confirmed" | "contradicted" | "stale" | undefined;
        structured_data?: Record<string, unknown> | z.objectInputType<{
            element: z.ZodOptional<z.ZodString>;
            action: z.ZodOptional<z.ZodString>;
            expected_result: z.ZodOptional<z.ZodString>;
            actual_result: z.ZodOptional<z.ZodString>;
            workaround: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
            error_code: z.ZodOptional<z.ZodString>;
            error_message: z.ZodOptional<z.ZodString>;
            trigger: z.ZodOptional<z.ZodString>;
            resolution: z.ZodOptional<z.ZodString>;
            recoverable: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
            method: z.ZodOptional<z.ZodString>;
            header: z.ZodOptional<z.ZodString>;
            token_location: z.ZodOptional<z.ZodString>;
            session_duration: z.ZodOptional<z.ZodString>;
            refresh_mechanism: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
            limit: z.ZodOptional<z.ZodNumber>;
            window: z.ZodOptional<z.ZodString>;
            header_remaining: z.ZodOptional<z.ZodString>;
            header_reset: z.ZodOptional<z.ZodString>;
            retry_after: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
            field: z.ZodOptional<z.ZodString>;
            format: z.ZodOptional<z.ZodString>;
            validation_regex: z.ZodOptional<z.ZodString>;
            encoding: z.ZodOptional<z.ZodString>;
            max_length: z.ZodOptional<z.ZodNumber>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        impact_estimate?: {
            time_saved_seconds?: number | undefined;
            success_rate_improvement?: number | undefined;
            reasoning?: string | undefined;
        } | undefined;
        impact_reports?: {
            agent_hash: string;
            helpful: boolean;
            reported_at: string;
            actual_time_saved_seconds?: number | undefined;
            task_succeeded?: boolean | undefined;
            feedback?: string | undefined;
        }[] | undefined;
        impact_stats?: {
            total_uses?: number | undefined;
            helpful_count?: number | undefined;
            avg_time_saved_seconds?: number | undefined;
            success_rate?: number | undefined;
        } | undefined;
        confirmations?: number | undefined;
        confirming_agents?: string[] | undefined;
        confidence?: number | undefined;
        urgency?: "normal" | "high" | "critical" | undefined;
        tags?: string[] | undefined;
        expires_at?: string | undefined;
    }>, "many">;
    query_embedding_time_ms: z.ZodOptional<z.ZodNumber>;
    search_time_ms: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    results: {
        status: "pending" | "confirmed" | "contradicted" | "stale";
        id: string;
        agent_hash: string;
        domain: string;
        category: "error" | "behavior" | "auth" | "rate_limit" | "format";
        summary: string;
        impact_reports: {
            agent_hash: string;
            helpful: boolean;
            reported_at: string;
            actual_time_saved_seconds?: number | undefined;
            task_succeeded?: boolean | undefined;
            feedback?: string | undefined;
        }[];
        confirmations: number;
        confirming_agents: string[];
        confidence: number;
        urgency: "normal" | "high" | "critical";
        tags: string[];
        created_at: string;
        updated_at: string;
        score: number;
        path?: string | undefined;
        structured_data?: Record<string, unknown> | z.objectOutputType<{
            element: z.ZodOptional<z.ZodString>;
            action: z.ZodOptional<z.ZodString>;
            expected_result: z.ZodOptional<z.ZodString>;
            actual_result: z.ZodOptional<z.ZodString>;
            workaround: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
            error_code: z.ZodOptional<z.ZodString>;
            error_message: z.ZodOptional<z.ZodString>;
            trigger: z.ZodOptional<z.ZodString>;
            resolution: z.ZodOptional<z.ZodString>;
            recoverable: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
            method: z.ZodOptional<z.ZodString>;
            header: z.ZodOptional<z.ZodString>;
            token_location: z.ZodOptional<z.ZodString>;
            session_duration: z.ZodOptional<z.ZodString>;
            refresh_mechanism: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
            limit: z.ZodOptional<z.ZodNumber>;
            window: z.ZodOptional<z.ZodString>;
            header_remaining: z.ZodOptional<z.ZodString>;
            header_reset: z.ZodOptional<z.ZodString>;
            retry_after: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectOutputType<{
            field: z.ZodOptional<z.ZodString>;
            format: z.ZodOptional<z.ZodString>;
            validation_regex: z.ZodOptional<z.ZodString>;
            encoding: z.ZodOptional<z.ZodString>;
            max_length: z.ZodOptional<z.ZodNumber>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        impact_estimate?: {
            time_saved_seconds?: number | undefined;
            success_rate_improvement?: number | undefined;
            reasoning?: string | undefined;
        } | undefined;
        impact_stats?: {
            total_uses: number;
            helpful_count: number;
            avg_time_saved_seconds?: number | undefined;
            success_rate?: number | undefined;
        } | undefined;
        expires_at?: string | undefined;
    }[];
    search_time_ms?: number | undefined;
    query_embedding_time_ms?: number | undefined;
}, {
    results: {
        id: string;
        agent_hash: string;
        domain: string;
        category: "error" | "behavior" | "auth" | "rate_limit" | "format";
        summary: string;
        created_at: string;
        updated_at: string;
        score: number;
        path?: string | undefined;
        status?: "pending" | "confirmed" | "contradicted" | "stale" | undefined;
        structured_data?: Record<string, unknown> | z.objectInputType<{
            element: z.ZodOptional<z.ZodString>;
            action: z.ZodOptional<z.ZodString>;
            expected_result: z.ZodOptional<z.ZodString>;
            actual_result: z.ZodOptional<z.ZodString>;
            workaround: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
            error_code: z.ZodOptional<z.ZodString>;
            error_message: z.ZodOptional<z.ZodString>;
            trigger: z.ZodOptional<z.ZodString>;
            resolution: z.ZodOptional<z.ZodString>;
            recoverable: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
            method: z.ZodOptional<z.ZodString>;
            header: z.ZodOptional<z.ZodString>;
            token_location: z.ZodOptional<z.ZodString>;
            session_duration: z.ZodOptional<z.ZodString>;
            refresh_mechanism: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
            limit: z.ZodOptional<z.ZodNumber>;
            window: z.ZodOptional<z.ZodString>;
            header_remaining: z.ZodOptional<z.ZodString>;
            header_reset: z.ZodOptional<z.ZodString>;
            retry_after: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | z.objectInputType<{
            field: z.ZodOptional<z.ZodString>;
            format: z.ZodOptional<z.ZodString>;
            validation_regex: z.ZodOptional<z.ZodString>;
            encoding: z.ZodOptional<z.ZodString>;
            max_length: z.ZodOptional<z.ZodNumber>;
            required: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        impact_estimate?: {
            time_saved_seconds?: number | undefined;
            success_rate_improvement?: number | undefined;
            reasoning?: string | undefined;
        } | undefined;
        impact_reports?: {
            agent_hash: string;
            helpful: boolean;
            reported_at: string;
            actual_time_saved_seconds?: number | undefined;
            task_succeeded?: boolean | undefined;
            feedback?: string | undefined;
        }[] | undefined;
        impact_stats?: {
            total_uses?: number | undefined;
            helpful_count?: number | undefined;
            avg_time_saved_seconds?: number | undefined;
            success_rate?: number | undefined;
        } | undefined;
        confirmations?: number | undefined;
        confirming_agents?: string[] | undefined;
        confidence?: number | undefined;
        urgency?: "normal" | "high" | "critical" | undefined;
        tags?: string[] | undefined;
        expires_at?: string | undefined;
    }[];
    search_time_ms?: number | undefined;
    query_embedding_time_ms?: number | undefined;
}>;
type SemanticSearchOutput = SearchOutput;
declare const ReportImpactInput: z.ZodObject<{
    observation_id: z.ZodString;
    helpful: z.ZodBoolean;
    task_succeeded: z.ZodOptional<z.ZodBoolean>;
    actual_time_saved_seconds: z.ZodOptional<z.ZodNumber>;
    feedback: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    helpful: boolean;
    observation_id: string;
    actual_time_saved_seconds?: number | undefined;
    task_succeeded?: boolean | undefined;
    feedback?: string | undefined;
}, {
    helpful: boolean;
    observation_id: string;
    actual_time_saved_seconds?: number | undefined;
    task_succeeded?: boolean | undefined;
    feedback?: string | undefined;
}>;
type ReportImpactInput = z.infer<typeof ReportImpactInput>;
declare const ReportImpactOutput: z.ZodObject<{
    success: z.ZodBoolean;
    observation_id: z.ZodString;
    message: z.ZodString;
    updated_stats: z.ZodOptional<z.ZodObject<{
        total_uses: z.ZodNumber;
        helpful_rate: z.ZodNumber;
        avg_time_saved_seconds: z.ZodOptional<z.ZodNumber>;
        success_rate: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        total_uses: number;
        helpful_rate: number;
        avg_time_saved_seconds?: number | undefined;
        success_rate?: number | undefined;
    }, {
        total_uses: number;
        helpful_rate: number;
        avg_time_saved_seconds?: number | undefined;
        success_rate?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    message: string;
    observation_id: string;
    success: boolean;
    updated_stats?: {
        total_uses: number;
        helpful_rate: number;
        avg_time_saved_seconds?: number | undefined;
        success_rate?: number | undefined;
    } | undefined;
}, {
    message: string;
    observation_id: string;
    success: boolean;
    updated_stats?: {
        total_uses: number;
        helpful_rate: number;
        avg_time_saved_seconds?: number | undefined;
        success_rate?: number | undefined;
    } | undefined;
}>;
type ReportImpactOutput = z.infer<typeof ReportImpactOutput>;

export { AggregationKey, type AggregationResult, Aggregator, AuthData, BehaviorData, ConfirmInput, ConfirmOutput, ConfirmationConfig, ConfirmationEngine, ContradictionDetector, type ContradictionResult, CreateObservation, EmbeddingConfig, EmbeddingGenerator, ErrorData, FailuresInput, FailuresOutput, FileTransport, FormatData, FuzzyMatcher, ImpactEstimate, ImpactReport, ImpactStats, JSONLStorage, LookupInput, LookupOutput, Observation, ObservationCategory, ObservationStatus, ObserveInput, ObserveOutput, PeerConfig, type ProcessObservationResult, Promoter, type PromotionResult, QdrantConfig, QdrantStorage, RateLimitData, ReportImpactInput, ReportImpactOutput, SQLiteStorage, SearchInput, SearchOutput, SearchResult, SemanticSearchInput, SemanticSearchOutput, StatsInput, StatsOutput, Storage, type StorageQueryOptions, StoredObservation, StructuredData, SubstrateConfig, type SubstrateContext, type SyncBatch, SyncConfig, SyncCoordinator, type SyncResult, UrgencyLevel, UrgentSignalHandler, VectorSearch, type VectorSearchFilters, type VectorSearchOptions, type VectorSearchResult, configFromEnv, createDefaultConfig, createSubstrateServer };
