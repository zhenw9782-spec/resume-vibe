/**
 * 现代设计版 PDF 模板（B）
 * 视觉优先的样式设计，适合创意/设计岗位求职
 */

import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import type { ResumeData } from '../generator'

Font.register({
  family: 'SimHei',
  src: '/fonts/simhei.ttf',
})

/**
 * 现代模板 Props
 */
interface ModernTemplateProps {
  resumeData: ResumeData
}

/**
 * 现代模板样式
 */
const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    fontFamily: 'SimHei',
    fontSize: 10,
    lineHeight: 1.5,
  },
  sidebar: {
    width: '35%',
    backgroundColor: '#1e40af',
    color: '#ffffff',
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  main: {
    width: '65%',
    padding: 32,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    letterSpacing: 3,
  },
  nameDivider: {
    width: 40,
    height: 3,
    backgroundColor: '#93c5fd',
    borderRadius: 1.5,
    marginBottom: 20,
  },
  contactSection: {
    marginBottom: 25,
  },
  contactTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#93c5fd',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3b82f6',
    paddingBottom: 4,
  },
  contactItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  contactDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#93c5fd',
    marginRight: 8,
  },
  contactItem: {
    fontSize: 9,
    color: '#e0e7ff',
  },
  sidebarSection: {
    marginBottom: 25,
  },
  sidebarTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#93c5fd',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3b82f6',
    paddingBottom: 4,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillTag: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    fontSize: 8,
    color: '#ffffff',
  },
  educationItem: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  educationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#93c5fd',
    marginRight: 8,
    marginTop: 4,
  },
  educationContent: {
    flex: 1,
    fontSize: 9,
    color: '#e0e7ff',
    lineHeight: 1.6,
  },
  mainSection: {
    marginBottom: 22,
  },
  mainTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
    paddingBottom: 5,
  },
  summary: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.7,
    marginBottom: 10,
  },
  experienceItem: {
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
    paddingLeft: 12,
  },
  experienceContent: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.6,
  },
  projectItem: {
    marginBottom: 12,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 4,
  },
  projectContent: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.6,
  },
})

/**
 * 现代设计版 PDF 模板
 */
export default function ModernTemplate({ resumeData }: ModernTemplateProps) {
  const contactItems: { label: string; value: string }[] = []
  if (resumeData.contact.phone) contactItems.push({ label: '电话', value: resumeData.contact.phone })
  if (resumeData.contact.email) contactItems.push({ label: '邮箱', value: resumeData.contact.email })
  if (resumeData.contact.address) contactItems.push({ label: '地址', value: resumeData.contact.address })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 左侧边栏 */}
        <View style={styles.sidebar}>
          {/* 姓名 */}
          <Text style={styles.name}>{resumeData.name || '简历'}</Text>
          <View style={styles.nameDivider} />

          {/* 联系方式 */}
          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>联系方式</Text>
            {contactItems.map((item, index) => (
              <View key={index} style={styles.contactItemRow}>
                <View style={styles.contactDot} />
                <Text style={styles.contactItem}>
                  {item.label}：{item.value}
                </Text>
              </View>
            ))}
          </View>

          {/* 专业技能 */}
          {resumeData.skills.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>专业技能</Text>
              <View style={styles.skillsContainer}>
                {resumeData.skills.map((skill, index) => (
                  <Text key={index} style={styles.skillTag}>
                    {skill}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* 教育背景 */}
          {resumeData.education.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>教育背景</Text>
              {resumeData.education.map((edu, index) => (
                <View key={index} style={styles.educationItem}>
                  <View style={styles.educationDot} />
                  <Text style={styles.educationContent}>{edu}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 右侧主内容区 */}
        <View style={styles.main}>
          {/* 个人简介 */}
          {resumeData.summary && (
            <View style={styles.mainSection}>
              <Text style={styles.mainTitle}>个人简介</Text>
              <Text style={styles.summary}>{resumeData.summary}</Text>
            </View>
          )}

          {/* 工作经历 */}
          {resumeData.experience.length > 0 && (
            <View style={styles.mainSection}>
              <Text style={styles.mainTitle}>工作经历</Text>
              {resumeData.experience.map((exp, index) => (
                <View key={index} style={styles.experienceItem}>
                  <Text style={styles.experienceContent}>{exp}</Text>
                </View>
              ))}
            </View>
          )}

          {/* 项目经历 */}
          {resumeData.projects.length > 0 && (
            <View style={styles.mainSection}>
              <Text style={styles.mainTitle}>项目经历</Text>
              {resumeData.projects.map((project, index) => (
                <View key={index} style={styles.projectItem}>
                  <Text style={styles.projectContent}>{project}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  )
}