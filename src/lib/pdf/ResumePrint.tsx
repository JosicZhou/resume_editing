"use client";

import React from "react";
import type { ResumeData, ResumeModule, TailoredResume } from "@/lib/types";

interface ResumePrintProps {
  resume: ResumeData;
  tailored?: TailoredResume | null;
  useOriginalIds?: string[];
}

const FONT_FAMILY =
  "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'STHeiti', 'SimHei', Arial, sans-serif";

const ResumePrint = React.forwardRef<HTMLDivElement, ResumePrintProps>(
  function ResumePrint({ resume, tailored, useOriginalIds = [] }, ref) {
    const getTitle = (type: string, defaultTitle: string) => {
      if (tailored?.sectionTitleOverrides[type]) {
        return tailored.sectionTitleOverrides[type];
      }
      const mod = resume.moduleOrder.find((m) => m.type === type);
      return mod?.title || defaultTitle;
    };

    // Priority: if useOriginalIds contains the id, use raw; otherwise polished > rewritten > raw
    const getDesc = (id: string, raw: string[]): string[] => {
      if (useOriginalIds.includes(id)) return raw;
      return tailored?.polishedDescriptions?.[id]?.length
        ? tailored.polishedDescriptions[id]
        : tailored?.rewrittenDescriptions?.[id]?.length
        ? tailored.rewrittenDescriptions[id]
        : raw;
    };

    const visibleModules = resume.moduleOrder
      .filter((m) => m.visible)
      .sort((a, b) => a.order - b.order);

    const work = tailored
      ? resume.work.filter((w) => tailored.selectedWorkIds.includes(w.id))
      : resume.work;

    const campus = tailored
      ? (resume.campus || []).filter((c) =>
          (tailored.selectedCampusIds || []).includes(c.id)
        )
      : resume.campus || [];

    const projects = tailored
      ? resume.projects.filter((p) =>
          tailored.selectedProjectIds.includes(p.id)
        )
      : resume.projects;

    const education = tailored
      ? resume.education.filter((e) =>
          tailored.selectedEducationIds.includes(e.id)
        )
      : resume.education;

    // Build labeled contact items
    const contactItems: { label: string; text: string }[] = [
      resume.personal.phone
        ? { label: "电话：", text: resume.personal.phone }
        : null,
      resume.personal.email
        ? { label: "邮箱：", text: resume.personal.email }
        : null,
      resume.personal.linkedin
        ? { label: "领英：", text: resume.personal.linkedin }
        : null,
      resume.personal.github
        ? { label: "GitHub：", text: resume.personal.github }
        : null,
      resume.personal.website
        ? { label: "个人网站：", text: resume.personal.website }
        : null,
    ].filter(Boolean) as { label: string; text: string }[];

    // Split into two rows: first two items on row 1, rest on row 2
    const contactRow1 = contactItems.slice(0, 2);
    const contactRow2 = contactItems.slice(2);

    const renderModule = (mod: ResumeModule) => {
      switch (mod.type) {
        case "personal":
          return null;

        case "education":
          if (education.length === 0) return null;
          return (
            <section key={mod.id} style={sectionWrap}>
              <div style={sectionTitle}>{getTitle("education", "教育经历")}</div>
              {education.map((edu) => (
                <div key={edu.id} style={entryWrap}>
                  <div style={entryRow}>
                    <div style={{ display: "inline-flex", alignItems: "center", flexWrap: "wrap", gap: "4px" }}>
                      <span style={entryBold}>{edu.school}</span>
                      {(edu.rankTags || []).map((tag) => (
                        <span key={tag} style={rankTag}>{tag}</span>
                      ))}
                    </div>
                    <span style={entryDate}>{edu.startDate} — {edu.endDate}</span>
                  </div>
                  <div style={entrySub}>
                    {edu.degree}
                    {edu.major ? `　${edu.major}` : ""}
                    {edu.gpa ? `　｜　GPA: ${edu.gpa}` : ""}
                  </div>
                  {edu.highlights.length > 0 && (
                    <ul style={bulletList}>
                      {edu.highlights.map((h, i) => (
                        <li key={i} style={bulletItem}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          );

        case "work":
          if (work.length === 0) return null;
          return (
            <section key={mod.id} style={sectionWrap}>
              <div style={sectionTitle}>{getTitle("work", "工作/实习经历")}</div>
              {work.map((w) => (
                <div key={w.id} style={entryWrap}>
                  <div style={{...entryRow, gap: "16px"}}>
                    <span style={{...entryBold, minWidth: "120px"}}>{w.company}</span>
                    <span style={{...entryBold, flex: 1, textAlign: "center", minWidth: "0"}}>{w.title}</span>
                    <span style={{...entryBold, fontSize: "8.5pt", whiteSpace: "nowrap"}}>{w.startDate} — {w.endDate}</span>
                  </div>
                  {getDesc(w.id, w.descriptions).length > 0 && (
                    <ol style={numList}>
                      {getDesc(w.id, w.descriptions).map((d, i) => (
                        <li key={i} style={numItem}>{d}</li>
                      ))}
                    </ol>
                  )}
                </div>
              ))}
            </section>
          );

        case "campus":
          if (campus.length === 0) return null;
          return (
            <section key={mod.id} style={sectionWrap}>
              <div style={sectionTitle}>{getTitle("campus", "校园经历")}</div>
              {campus.map((c) => (
                <div key={c.id} style={entryWrap}>
                  <div style={{...entryRow, gap: "16px"}}>
                    <span style={{...entryBold, minWidth: "120px"}}>{c.company}</span>
                    <span style={{...entryBold, flex: 1, textAlign: "center", minWidth: "0"}}>{c.title}</span>
                    <span style={{...entryBold, fontSize: "8.5pt", whiteSpace: "nowrap"}}>{c.startDate} — {c.endDate}</span>
                  </div>
                  {getDesc(c.id, c.descriptions).length > 0 && (
                    <ol style={numList}>
                      {getDesc(c.id, c.descriptions).map((d, i) => (
                        <li key={i} style={numItem}>{d}</li>
                      ))}
                    </ol>
                  )}
                </div>
              ))}
            </section>
          );

        case "project":
          if (projects.length === 0) return null;
          return (
            <section key={mod.id} style={sectionWrap}>
              <div style={sectionTitle}>{getTitle("project", "项目经历")}</div>
              {projects.map((p) => (
                <div key={p.id} style={entryWrap}>
                  <div style={{...entryRow, gap: "16px"}}>
                    <span style={{...entryBold, minWidth: "120px"}}>{p.name}</span>
                    <span style={{...entryBold, flex: 1, textAlign: "center", minWidth: "0"}}>{p.role || "核心成员"}</span>
                    <span style={{...entryBold, fontSize: "8.5pt", whiteSpace: "nowrap"}}>{p.startDate} — {p.endDate}</span>
                  </div>
                  {p.techStack.length > 0 && (
                    <div style={{ ...entrySub, marginBottom: "2px" }}>
                      技术栈：{p.techStack.join(" · ")}
                    </div>
                  )}
                  {getDesc(p.id, p.descriptions).length > 0 && (
                    <ol style={numList}>
                      {getDesc(p.id, p.descriptions).map((d, i) => (
                        <li key={i} style={numItem}>{d}</li>
                      ))}
                    </ol>
                  )}
                </div>
              ))}
            </section>
          );

        case "skill": {
          const skills = tailored
            ? resume.skills.filter((sk) => (tailored.selectedSkillIds || []).includes(sk.id))
            : resume.skills;
          if (skills.length === 0) return null;
          return (
            <section key={mod.id} style={sectionWrap}>
              <div style={sectionTitle}>{getTitle("skill", "专业技能")}</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9.5pt" }}>
                <tbody>
                  {skills.map((sk) => (
                    <tr key={sk.id}>
                      <td style={{ fontWeight: "bold", whiteSpace: "nowrap", paddingRight: "12px", verticalAlign: "top", paddingBottom: "3px", width: "80px" }}>
                        {sk.category}：
                      </td>
                      <td style={{ verticalAlign: "top", paddingBottom: "3px", color: "#1a1a1a" }}>
                        {(tailored?.optimizedSkills?.[sk.id] ?? sk.items).join("、")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          );
        }

        case "award": {
          const awards = tailored
            ? (resume.awards || []).filter((a) => (tailored.selectedAwardIds || []).includes(a.id))
            : resume.awards || [];
          if (awards.length === 0) return null;
          return (
            <section key={mod.id} style={sectionWrap}>
              <div style={sectionTitle}>{getTitle("award", "荣誉奖项")}</div>
              {awards.map((a) => (
                <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3px", fontSize: "9.5pt" }}>
                  <span>
                    • {a.name}
                    {a.description ? <span style={{ color: "#555", marginLeft: "6px" }}>— {a.description}</span> : null}
                  </span>
                  {a.date && <span style={{ color: "#555", whiteSpace: "nowrap", marginLeft: "12px", fontSize: "9pt" }}>{a.date}</span>}
                </div>
              ))}
            </section>
          );
        }

        case "custom": {
          const sec = (resume.customSections || []).find((s) => s.id === mod.id);
          if (!sec) return null;
          if (tailored && !(tailored.selectedCustomSectionIds || []).includes(sec.id)) return null;
          if (sec.items.length === 0) return null;
          // Portfolio-type sections (作品集/个人网站) with images: shown in header only, skip body
          if ((sec.title === "作品集" || sec.title === "个人网站") && sec.items.some((i) => i.imageUrl)) return null;
          return (
            <section key={mod.id} style={sectionWrap}>
              <div style={sectionTitle}>{sec.title}</div>
              {sec.items.map((item) => (
                <div key={item.id} style={entryWrap}>
                  <div style={entryRow}>
                    <span style={entryBold}>{item.heading}</span>
                    {item.date && <span style={entryDate}>{item.date}</span>}
                  </div>
                  {item.subheading && <div style={entrySub}>{item.subheading}</div>}
                  {item.link && <div style={{ ...entrySub, color: "#1a56db", wordBreak: "break-all" }}>{item.link}</div>}
                  {item.descriptions.length > 0 && (
                    <ul style={bulletList}>
                      {item.descriptions.map((d, i) => (
                        <li key={i} style={bulletItem}>{d}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          );
        }

        default:
          return null;
      }
    };

    return (
      <>
        <style>{`
          @media print {
            @page { size: A4; margin: 0; }
            body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
          .resume-print-root * { box-sizing: border-box; }
          .resume-print-root ol { padding-left: 18px; margin: 3px 0 0 0; }
          .resume-print-root ul { padding-left: 16px; margin: 3px 0 0 0; list-style-type: disc; }
          .resume-print-root li { margin-bottom: 2px; }
        `}</style>

        <div ref={ref} className="resume-print-root" style={pageRoot}>

          {/* ── Header ── */}
          <div style={headerWrap}>

            {/* 左：头像 */}
            {resume.personal.avatar && (
              <div style={avatarWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resume.personal.avatar} alt="avatar" style={avatarImg} />
              </div>
            )}

            {/* 中：姓名 + 联系方式 */}
            <div style={headerCenter}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <span style={{ ...nameStyle, marginBottom: 0 }}>{resume.personal.name || "姓名"}</span>
                {resume.personal.schoolLogo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resume.personal.schoolLogo}
                    alt="school logo"
                    style={{ height: "32px", width: "auto", display: "block", flexShrink: 0, objectFit: "contain" }}
                  />
                )}
              </div>
              <div style={contactBlock}>
                {/* Row 1 */}
                {contactRow1.length > 0 && (
                  <div style={contactLine}>
                    {contactRow1.map((item, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <span style={contactSep}>｜</span>}
                        <span>
                          <span style={contactLabel}>{item.label}</span>
                          <span style={contactText}>{item.text}</span>
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                )}
                {/* Row 2 */}
                {contactRow2.length > 0 && (
                  <div style={contactLine}>
                    {contactRow2.map((item, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <span style={contactSep}>｜</span>}
                        <span>
                          <span style={contactLabel}>{item.label}</span>
                          <span style={contactText}>{item.text}</span>
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 右：作品集/个人网站图片（大图 + 标签） */}
            {(() => {
              const portfolioSections = (resume.customSections || []).filter(
                (sec) => sec.title === "作品集" || sec.title === "个人网站"
              );
              // 优先查找"作品集"，如果没有再找"个人网站"
              const sortedSections = portfolioSections.sort((a, b) => {
                if (a.title === "作品集" && b.title === "个人网站") return -1;
                if (a.title === "个人网站" && b.title === "作品集") return 1;
                return 0;
              });
              const firstPortfolio = sortedSections
                .flatMap((sec) => sec.items.map((item) => ({ ...item, sectionTitle: sec.title })))
                .find((item) => item.imageUrl);
              if (!firstPortfolio) return null;
              return (
                <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", paddingTop: "2px" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={firstPortfolio.imageUrl!}
                    alt={firstPortfolio.heading || firstPortfolio.sectionTitle}
                    style={{ height: "88px", width: "auto", maxWidth: "120px", display: "block", objectFit: "contain" }}
                  />
                  <span style={{ fontSize: "7pt", color: "#999", letterSpacing: "0.5px", marginTop: "2px" }}>
                    {firstPortfolio.sectionTitle}
                  </span>
                </div>
              );
            })()}

          </div>

          {/* ── Sections ── */}
          {visibleModules.map(renderModule)}
        </div>
      </>
    );
  }
);

ResumePrint.displayName = "ResumePrint";
export default ResumePrint;

// ─── Styles ────────────────────────────────────────────────────────────────

const pageRoot: React.CSSProperties = {
  fontFamily: FONT_FAMILY,
  fontSize: "9pt",
  color: "#1a1a1a",
  lineHeight: 1.3,
  padding: "8mm 12mm 10mm 12mm",
  maxWidth: "210mm",
  margin: "0 auto",
  backgroundColor: "#fff",
};

// Header
const headerWrap: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "14px",
  marginBottom: "6px",
};

const avatarWrap: React.CSSProperties = {
  flexShrink: 0,
};

const avatarImg: React.CSSProperties = {
  width: "68px",
  height: "88px",
  borderRadius: "3px",
  objectFit: "cover",
  objectPosition: "center top",
  display: "block",
  border: "1px solid #ddd",
};

const headerCenter: React.CSSProperties = {
  flex: 1,
  paddingTop: "2px",
};

const nameStyle: React.CSSProperties = {
  fontSize: "24pt",
  fontWeight: "bold",
  letterSpacing: "4px",
  marginBottom: "6px",
  color: "#000",
  lineHeight: 1.2,
};

const contactBlock: React.CSSProperties = {
  fontSize: "8.5pt",
  color: "#1a1a1a",
  lineHeight: 1.6,
};

const contactLine: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "0",
};

const contactLabel: React.CSSProperties = {
  fontWeight: 600,
  marginRight: "2px",
};

const contactText: React.CSSProperties = {
  color: "#222",
};

const contactSep: React.CSSProperties = {
  color: "#bbb",
  margin: "0 6px",
};




// Sections
const sectionWrap: React.CSSProperties = {
  marginBottom: "9px",
};

const sectionTitle: React.CSSProperties = {
  fontSize: "10.5pt",
  fontWeight: "bold",
  color: "#8B1A1A",
  borderBottom: "1.2px solid #333",
  paddingBottom: "2px",
  marginBottom: "6px",
  letterSpacing: "1px",
};

// Entry rows
const entryWrap: React.CSSProperties = {
  marginBottom: "7px",
};

const entryRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: "8px",
};

const entryBold: React.CSSProperties = {
  fontWeight: "bold",
  fontSize: "9.5pt",
  color: "#000",
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  flexWrap: "wrap",
};

const entryDate: React.CSSProperties = {
  fontSize: "8.5pt",
  color: "#000",
  whiteSpace: "nowrap",
  flexShrink: 0,
};

const entrySub: React.CSSProperties = {
  fontSize: "9pt",
  color: "#222",
  marginBottom: "1px",
};

const entryLocation: React.CSSProperties = {
  fontSize: "8.5pt",
  color: "#555",
  whiteSpace: "nowrap",
  flexShrink: 0,
};

// Blue rank tag (matching PolyU PDF style)
const rankTag: React.CSSProperties = {
  display: "inline-block",
  fontSize: "7.5pt",
  fontWeight: 500,
  color: "#1565c0",
  backgroundColor: "#eaf3fb",
  border: "0.8px solid #5c9bd6",
  borderRadius: "3px",
  padding: "0.5px 4px",
  lineHeight: 1.5,
  marginLeft: "3px",
  verticalAlign: "middle",
  position: "relative",
  top: "-1px",
};

// Lists
const bulletList: React.CSSProperties = {
  paddingLeft: "16px",
  margin: "3px 0 0 0",
  listStyleType: "disc",
};

const bulletItem: React.CSSProperties = {
  fontSize: "9pt",
  lineHeight: 1.45,
  marginBottom: "2px",
  color: "#1a1a1a",
};

const numList: React.CSSProperties = {
  paddingLeft: "18px",
  margin: "3px 0 0 0",
  listStyleType: "decimal",
};

const numItem: React.CSSProperties = {
  fontSize: "9pt",
  lineHeight: 1.45,
  marginBottom: "2px",
  color: "#1a1a1a",
};
