#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import xlsxwriter


ROOT = Path("/Users/amummaneni/Desktop/Codex/Projects/wonderquest-learning")
DATA_DIR = ROOT / "data" / "launch"
PLANNING_DIR = ROOT / "planning"
OUTPUT_FILE = PLANNING_DIR / "WonderQuest_Learning_Planning_Workbook.xlsx"

def read_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def normalize(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, bool):
        return "TRUE" if value else "FALSE"
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, list):
        return ", ".join(normalize(item) for item in value)
    if isinstance(value, dict):
        return json.dumps(value, ensure_ascii=True)
    return str(value)


def write_title(ws, workbook, title: str, description: str) -> None:
    title_fmt = workbook.add_format({
        "bold": True,
        "font_size": 18,
        "font_color": "#12352A",
    })
    desc_fmt = workbook.add_format({
        "font_size": 10,
        "font_color": "#4B5B54",
        "text_wrap": True,
    })
    ws.write("A1", title, title_fmt)
    ws.write("A2", description, desc_fmt)
    ws.set_row(0, 24)
    ws.set_row(1, 36)


def add_table_sheet(workbook, ws, title: str, description: str, rows: list[dict[str, Any]], preferred_columns: list[str] | None = None) -> None:
    write_title(ws, workbook, title, description)
    headers = preferred_columns or sorted({key for row in rows for key in row.keys()})
    header_fmt = workbook.add_format({
        "bold": True,
        "bg_color": "#E3F2EA",
        "font_color": "#12352A",
        "border": 1,
    })
    cell_fmt = workbook.add_format({
        "text_wrap": True,
        "valign": "top",
        "border": 1,
    })
    for col, header in enumerate(headers):
        ws.write(3, col, header, header_fmt)
    for row_idx, row in enumerate(rows, start=4):
        for col, header in enumerate(headers):
            ws.write(row_idx, col, normalize(row.get(header, "")), cell_fmt)
    ws.freeze_panes(4, 0)
    ws.autofilter(3, 0, max(3, 3 + len(rows)), max(0, len(headers) - 1))
    for idx, header in enumerate(headers):
        max_width = max(len(header) + 2, 14)
        for row in rows:
            max_width = max(max_width, min(48, len(normalize(row.get(header, ""))) + 2))
        ws.set_column(idx, idx, min(48, max_width))


def write_overview(workbook, ws) -> None:
    write_title(ws, workbook, "WonderQuest Planning Workbook", "Working workbook for the next build window.")
    body = workbook.add_format({"text_wrap": True, "valign": "top"})
    key = workbook.add_format({"bold": True, "font_color": "#12352A"})
    ws.write("A4", "Purpose", key)
    ws.write("B4", "Capture the first executable version of WonderQuest Learning across flows, content, progress, notifications, and challenge paths.", body)
    ws.write("A5", "Launch scope", key)
    ws.write("B5", "Ages 2 to 5, K-1, 2-3, and 4-5 with one primary theme family per band.", body)
    ws.write("A6", "Access model", key)
    ws.write("B6", "Username + 4-digit PIN + display name + avatar for kids, with lightweight parent linkage.", body)
    ws.write("A7", "Persistence rule", key)
    ws.write("B7", "Tester and pilot progress should persist and never be reset just because the user is in testing.", body)
    ws.write("A8", "Delivery focus", key)
    ws.write("B8", "Voice/video explainers, self-directed challenges, simple feedback handling, and parent effectiveness reporting.", body)
    ws.set_column("A:A", 20)
    ws.set_column("B:B", 110)
    ws.freeze_panes(3, 0)


def build_workbook() -> None:
    launch_bands = read_json(DATA_DIR / "launch_bands.json")
    avatars = read_json(DATA_DIR / "avatars.json")
    skills = read_json(DATA_DIR / "skills.json")
    content_templates = read_json(DATA_DIR / "content_templates.json")
    session_modes = read_json(DATA_DIR / "session_modes.json")
    onboarding = read_json(DATA_DIR / "onboarding_flows.json")
    challenge_paths = read_json(DATA_DIR / "challenge_paths.json")
    explainers = read_json(DATA_DIR / "explainers.json")
    questions = read_json(DATA_DIR / "sample_questions.json")
    notifications = read_json(DATA_DIR / "notification_scenarios.json")

    PLANNING_DIR.mkdir(parents=True, exist_ok=True)
    workbook = xlsxwriter.Workbook(OUTPUT_FILE.as_posix())

    overview_ws = workbook.add_worksheet("Overview")
    write_overview(workbook, overview_ws)

    launch_ws = workbook.add_worksheet("Launch Bands")
    add_table_sheet(workbook, launch_ws, "Launch Bands", "Primary launch bands and theme mapping.", launch_bands, [
        "code", "display_name", "audience", "primary_theme", "theme_label", "focus"
    ])

    avatars_ws = workbook.add_worksheet("Avatars")
    add_table_sheet(workbook, avatars_ws, "Avatars", "Starter avatar choices by launch band and theme.", avatars, [
        "avatar_key", "launch_band", "theme", "display_name"
    ])

    skills_ws = workbook.add_worksheet("Skills")
    add_table_sheet(workbook, skills_ws, "Skills", "Starter skill taxonomy for the first launch bands.", skills, [
        "code", "subject", "launch_band", "display_name", "description"
    ])

    templates_ws = workbook.add_worksheet("Content Templates")
    add_table_sheet(workbook, templates_ws, "Content Templates", "Reusable content templates for the first launch bands.", content_templates, [
        "template_key", "subject", "launch_band", "modality", "reading_load", "prompt_pattern", "answer_pattern", "explanation_pattern"
    ])

    modes_ws = workbook.add_worksheet("Session Modes")
    add_table_sheet(workbook, modes_ws, "Session Modes", "Core session modes for child, parent, and teacher use.", session_modes, [
        "mode_key", "audience", "description"
    ])

    onboarding_ws = workbook.add_worksheet("Onboarding")
    add_table_sheet(workbook, onboarding_ws, "Onboarding Flows", "Child and parent access, setup, and resume paths.", onboarding, [
        "flow_id", "audience", "step_order", "screen_title", "goal", "primary_fields", "notes"
    ])

    challenge_ws = workbook.add_worksheet("Challenge Paths")
    add_table_sheet(workbook, challenge_ws, "Challenge Paths", "Child-driven challenge requests and system responses.", challenge_paths, [
        "path_id", "audience", "trigger", "system_response", "guardrail"
    ])

    explainer_ws = workbook.add_worksheet("Explainers")
    add_table_sheet(workbook, explainer_ws, "Explainers", "Age-specific quick explanations with voice/video guidance.", explainers, [
        "explainer_key", "launch_band", "subject", "format", "misconception", "script", "media_hint"
    ])

    question_ws = workbook.add_worksheet("Questions")
    add_table_sheet(workbook, question_ws, "Sample Questions", "Starter question bank across bands and themes.", questions, [
        "question_key", "launch_band", "subject", "skill", "theme", "prompt", "correct_answer", "distractors", "modality", "difficulty", "explainer_key"
    ])

    notification_ws = workbook.add_worksheet("Notifications")
    add_table_sheet(workbook, notification_ws, "Notification Scenarios", "Parent notification triggers and purpose statements.", notifications, [
        "notification_type", "audience", "trigger", "purpose"
    ])

    flow_builder_ws = workbook.add_worksheet("Flow Builder")
    write_title(flow_builder_ws, workbook, "Blank Flow Builder", "Use this sheet to add future flows, variants, and edge cases.")
    flow_headers = ["flow_id", "audience", "step_order", "screen_title", "goal", "primary_fields", "notes", "status"]
    for col, header in enumerate(flow_headers):
        flow_builder_ws.write(3, col, header, workbook.add_format({"bold": True, "bg_color": "#E3F2EA", "border": 1}))
    for row in range(4, 40):
        for col in range(len(flow_headers)):
            flow_builder_ws.write_blank(row, col, None, workbook.add_format({"border": 1}))
    flow_builder_ws.freeze_panes(4, 0)
    flow_builder_ws.set_column(0, len(flow_headers) - 1, 22)

    qa_builder_ws = workbook.add_worksheet("Q&A Builder")
    write_title(qa_builder_ws, workbook, "Blank Q&A Builder", "Use this sheet to add more question, answer, and explainer pairs.")
    qa_headers = ["question_key", "launch_band", "subject", "skill", "theme", "prompt", "correct_answer", "distractors", "modality", "difficulty", "explainer_key", "status"]
    for col, header in enumerate(qa_headers):
        qa_builder_ws.write(3, col, header, workbook.add_format({"bold": True, "bg_color": "#E3F2EA", "border": 1}))
    for row in range(4, 80):
        for col in range(len(qa_headers)):
            qa_builder_ws.write_blank(row, col, None, workbook.add_format({"border": 1}))
    qa_builder_ws.freeze_panes(4, 0)
    qa_builder_ws.set_column(0, len(qa_headers) - 1, 24)

    workbook.close()


if __name__ == "__main__":
    build_workbook()
    print(f"Workbook written to {OUTPUT_FILE}")
