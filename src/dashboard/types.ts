/**
 * Project Dashboard tab-data types (§6.10).
 *
 * Each tab is a pure-function data assembler returning one of these
 * shapes. The HTTP server JSON-serialises and serves them at
 * `/api/<tab>` endpoints; the single-page HTML re-renders on poll.
 */

export interface StatusData {
  project: { name: string; slug: string } | null;
  current_phase: number | null;
  current_phase_name: string | null;
  last_gate_evaluation: {
    gate_id: string;
    phase: number;
    overall: "pass" | "fail" | "pending-human";
    evaluated_at: string;
  } | null;
  sacred_doc_signoffs: {
    gate_id: string;
    check_id: string;
    signed_by: string;
    signed_at: string;
  }[];
}

export interface StatsData {
  skill_invocations: {
    total: number;
    success: number;
    fail: number;
    by_skill: Record<string, number>;
  };
  graph: { node_count: number; edge_count: number } | null;
  sacred_docs: {
    expected: number;
    present: number;
    missing: string[];
  };
  runs: {
    total: number;
    latest: string | null;
  };
}

export type SanityPanelStatus = "ok" | "warn" | "fail";

export interface SanityPanel {
  id: string;
  title: string;
  status: SanityPanelStatus;
  detail: string;
}

export interface SanityData {
  overall: SanityPanelStatus;
  panels: SanityPanel[];
}

export interface TechStackData {
  present: boolean;
  path: string;
  frontmatter: Record<string, unknown> | null;
}

export interface TodoItem {
  source:
    | "gate-blocker"
    | "need-info"
    | "pending-signoff"
    | "sprint-change-proposal";
  title: string;
  detail: string;
  ref?: string;
}

export interface TodosData {
  items: TodoItem[];
}

export interface GraphTabData {
  has_graph: boolean;
  graph_path: string;
  node_count: number;
  edge_count: number;
  subgraphs: string[];
}

export interface QuickLink {
  label: string;
  href: string;
  category: "deploy" | "repo" | "audit" | "doc";
}

export interface QuickLinksData {
  links: QuickLink[];
}
