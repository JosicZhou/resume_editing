"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { ResumeData, ResumeModule, TailoredResume } from "@/lib/types";

// 注册支持中文的字体
Font.register({
  family: "STHeiti",
  fonts: [
    { src: "/fonts/STHeitiLight-subset.ttf", fontWeight: "normal" },
    { src: "/fonts/STHeitiMedium-subset.ttf", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    paddingTop: 25,
    paddingBottom: 25,
    fontSize: 10,
    fontFamily: "STHeiti",
    color: "#1a1a1a",
    lineHeight: 1.4,
  },
  header: {
    textAlign: "center",
    marginBottom: 12,
    borderBottom: "1.8pt solid #222222",
    paddingBottom: 8,
  },
  name: {
    fontSize: 20,
    fontFamily: "STHeiti",
    fontWeight: "bold",
    letterSpacing: 3,
    marginBottom: 4,
    color: "#000000",
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    fontSize: 9,
    color: "#1a1a1a",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  separator: {
    marginHorizontal: 4,
    color: "#9ca3af",
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "STHeiti",
    fontWeight: "bold",
    color: "#8B1A1A",
    borderBottom: "1pt solid #333333",
    paddingBottom: 2,
    marginBottom: 6,
    letterSpacing: 0.8,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  entryTitle: {
    fontFamily: "STHeiti",
    fontWeight: "bold",
    fontSize: 10,
  },
  entrySubtitle: {
    fontSize: 9,
    color: "#4b5563",
  },
  entryDate: {
    fontSize: 9,
    color: "#000000",
  },
  bulletList: {
    paddingLeft: 8,
    marginTop: 2,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 1.5,
  },
  bullet: {
    width: 8,
    fontSize: 9,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.4,
  },
  skillRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  skillCategory: {
    fontFamily: "STHeiti",
    fontWeight: "bold",
    fontSize: 9,
    width: 70,
  },
  skillItems: {
    flex: 1,
    fontSize: 9,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 3,
    marginTop: 1,
  },
  tag: {
    fontSize: 7.5,
    color: "#1565c0",
    backgroundColor: "#eaf3fb",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
});

interface ResumeDocumentProps {
  resume: ResumeData;
  tailored?: TailoredResume | null;
}

export default function ResumeDocument({
  resume,
  tailored,
}: ResumeDocumentProps) {
  const getTitle = (type: string, defaultTitle: string) => {
    if (tailored?.sectionTitleOverrides[type]) {
      return tailored.sectionTitleOverrides[type];
    }
    const mod = resume.moduleOrder.find((m) => m.type === type);
    return mod?.title || defaultTitle;
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
    : (resume.campus || []);

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

  const renderSection = (mod: ResumeModule) => {
    switch (mod.type) {
      case "personal":
        return null;
      case "education":
        if (education.length === 0) return null;
        return (
          <View key={mod.id} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {getTitle("education", "教育经历")}
            </Text>
            {education.map((edu) => (
              <View key={edu.id} style={{ marginBottom: 4 }}>
                <View style={styles.entryHeader}>
                  <View>
                    <Text style={styles.entryTitle}>{edu.school}</Text>
                    <Text style={styles.entrySubtitle}>
                      {edu.degree} · {edu.major}
                      {edu.gpa ? ` | GPA: ${edu.gpa}` : ""}
                    </Text>
                  </View>
                  <Text style={styles.entryDate}>
                    {edu.startDate} - {edu.endDate}
                  </Text>
                </View>
                {edu.highlights.length > 0 && (
                  <View style={styles.bulletList}>
                    {edu.highlights.map((h, i) => (
                      <View key={i} style={styles.bulletItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{h}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        );
      case "work":
        if (work.length === 0) return null;
        return (
          <View key={mod.id} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {getTitle("work", "工作/实习经历")}
            </Text>
            {work.map((w) => (
              <View key={w.id} style={{ marginBottom: 5 }}>
                <View style={styles.entryHeader}>
                  <View>
                    <Text style={styles.entryTitle}>
                      {w.company}
                      {w.location ? ` · ${w.location}` : ""}
                    </Text>
                    <Text style={styles.entrySubtitle}>{w.title}</Text>
                  </View>
                  <Text style={styles.entryDate}>
                    {w.startDate} - {w.endDate}
                  </Text>
                </View>
                {w.descriptions.length > 0 && (
                  <View style={styles.bulletList}>
                    {w.descriptions.map((d, i) => (
                      <View key={i} style={styles.bulletItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{d}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        );
      case "campus":
        if (campus.length === 0) return null;
        return (
          <View key={mod.id} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {getTitle("campus", "校园经历")}
            </Text>
            {campus.map((c) => (
              <View key={c.id} style={{ marginBottom: 5 }}>
                <View style={styles.entryHeader}>
                  <View>
                    <Text style={styles.entryTitle}>
                      {c.company}
                      {c.location ? ` · ${c.location}` : ""}
                    </Text>
                    <Text style={styles.entrySubtitle}>{c.title}</Text>
                  </View>
                  <Text style={styles.entryDate}>
                    {c.startDate} - {c.endDate}
                  </Text>
                </View>
                {c.descriptions.length > 0 && (
                  <View style={styles.bulletList}>
                    {c.descriptions.map((d, i) => (
                      <View key={i} style={styles.bulletItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{d}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        );
      case "project":
        if (projects.length === 0) return null;
        return (
          <View key={mod.id} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {getTitle("project", "项目经历")}
            </Text>
            {projects.map((p) => (
              <View key={p.id} style={{ marginBottom: 5 }}>
                <View style={styles.entryHeader}>
                  <View>
                    <Text style={styles.entryTitle}>
                      {p.name}
                      {p.role ? ` · ${p.role}` : ""}
                    </Text>
                    {p.techStack.length > 0 && (
                      <Text style={styles.entrySubtitle}>
                        技术栈: {p.techStack.join(", ")}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.entryDate}>
                    {p.startDate} - {p.endDate}
                  </Text>
                </View>
                {p.descriptions.length > 0 && (
                  <View style={styles.bulletList}>
                    {p.descriptions.map((d, i) => (
                      <View key={i} style={styles.bulletItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{d}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        );
      case "skill":
        if (resume.skills.length === 0) return null;
        return (
          <View key={mod.id} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {getTitle("skill", "专业技能")}
            </Text>
            {resume.skills.map((sk) => (
              <View key={sk.id} style={styles.skillRow}>
                <Text style={styles.skillCategory}>{sk.category}:</Text>
                <Text style={styles.skillItems}>{sk.items.join("、")}</Text>
              </View>
            ))}
          </View>
        );
      case "award":
        if (resume.awards.length === 0) return null;
        return (
          <View key={mod.id} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {getTitle("award", "荣誉奖项")}
            </Text>
            {resume.awards.map((a) => (
              <View key={a.id} style={styles.bulletItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>
                  {a.name}
                  {a.date ? ` (${a.date})` : ""}
                  {a.description ? ` — ${a.description}` : ""}
                </Text>
              </View>
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header / Personal Info */}
        <View style={styles.header}>
          <Text style={styles.name}>{resume.personal.name || "你的姓名"}</Text>
          <View style={styles.contactRow}>
            {resume.personal.phone && (
              <Text>{resume.personal.phone}</Text>
            )}
            {resume.personal.phone && resume.personal.email && (
              <Text style={styles.separator}>|</Text>
            )}
            {resume.personal.email && (
              <Text>{resume.personal.email}</Text>
            )}
            {resume.personal.location && (
              <>
                <Text style={styles.separator}>|</Text>
                <Text>{resume.personal.location}</Text>
              </>
            )}
            {resume.personal.linkedin && (
              <>
                <Text style={styles.separator}>|</Text>
                <Text>{resume.personal.linkedin}</Text>
              </>
            )}
            {resume.personal.github && (
              <>
                <Text style={styles.separator}>|</Text>
                <Text>{resume.personal.github}</Text>
              </>
            )}
          </View>
        </View>

        {/* Sections */}
        {visibleModules.map(renderSection)}
      </Page>
    </Document>
  );
}
