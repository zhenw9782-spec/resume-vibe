/**
 * 经典专业版 PDF 模板（A）
 * 简洁清晰、ATS 友好，适合大多数求职场景
 */

import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import type { ResumeData } from '../generator'

Font.register({
  family: 'SimHei',
  src: '/fonts/simhei.ttf',
})

/**
 * 经典模板 Props
 */
interface ClassicTemplateProps {
  resumeData: ResumeData
}

/**
 * 经典模板样式
 */
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 48,
    fontFamily: 'SimHei',
    fontSize: 10,
    lineHeight: 1.5,
    color: '#111827',
  },
  header: {
    marginBottom: 26,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#2563EB',
  },
  name: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 4,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    fontSize: 9,
    color: '#6b7280',
  },
  contactItem: {
    paddingHorizontal: 8,
  },
})

const sectionStyles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  summary: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.7,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillItem: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 9,
    color: '#374151',
  },
  listItem: {
    marginBottom: 10,
  },
  listContent: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.6,
  },
})

/**
 * 经典专业版 PDF 模板
 */
export default function ClassicTemplate({ resumeData }: ClassicTemplateProps) {
  const contactItems: string[] = []
  if (resumeData.contact.phone) contactItems.push(`电话：${resumeData.contact.phone}`)
  if (resumeData.contact.email) contactItems.push(`邮箱：${resumeData.contact.email}`)
  if (resumeData.contact.address) contactItems.push(`地址：${resumeData.contact.address}`)

  const renderSectionTitle = (title: string) => (
    <Text style={sectionStyles.sectionTitle}>{title}</Text>
  )

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 头部信息：姓名 + 联系方式 */}
        <View style={styles.header}>
          <Text style={styles.name}>{resumeData.name || '简历'}</Text>
          {contactItems.length > 0 && (
            <View style={styles.contactRow}>
              {contactItems.map((item, index) => (
                <Text key={index} style={styles.contactItem}>
                  {item}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* 个人简介 */}
        {resumeData.summary && (
          <View style={sectionStyles.section}>
            {renderSectionTitle('个人简介')}
            <Text style={sectionStyles.summary}>{resumeData.summary}</Text>
          </View>
        )}

        {/* 工作经历 */}
        {resumeData.experience.length > 0 && (
          <View style={sectionStyles.section}>
            {renderSectionTitle('工作经历')}
            {resumeData.experience.map((exp, index) => (
              <View key={index} style={sectionStyles.listItem}>
                <Text style={sectionStyles.listContent}>{exp}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 教育背景 */}
        {resumeData.education.length > 0 && (
          <View style={sectionStyles.section}>
            {renderSectionTitle('教育背景')}
            {resumeData.education.map((edu, index) => (
              <View key={index} style={sectionStyles.listItem}>
                <Text style={sectionStyles.listContent}>{edu}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 专业技能 */}
        {resumeData.skills.length > 0 && (
          <View style={sectionStyles.section}>
            {renderSectionTitle('专业技能')}
            <View style={sectionStyles.skillsContainer}>
              {resumeData.skills.map((skill, index) => (
                <Text key={index} style={sectionStyles.skillItem}>
                  {skill}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* 项目经历 */}
        {resumeData.projects.length > 0 && (
          <View style={sectionStyles.section}>
            {renderSectionTitle('项目经历')}
            {resumeData.projects.map((project, index) => (
              <View key={index} style={sectionStyles.listItem}>
                <Text style={sectionStyles.listContent}>{project}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  )
}