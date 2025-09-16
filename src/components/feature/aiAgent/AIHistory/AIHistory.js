/* eslint-disable react-hooks/exhaustive-deps */
import { useTheme } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { SectionList, TouchableOpacity, SafeAreaView } from 'react-native';
import getStyles from './AIHistory.styles';
import CText from '../../../common/core/Text';
import CView from '../../../common/core/View';

const searchHistoryData = {
  searches: [
    {
      id: '1',
      timestamp: '2024-01-14T10:00:00',
      prompt: 'Create a rock song to set stage on fire',
      results: [
        {
          id: '101',
          songName: 'Rock, Bold, Rage',
          duration: '2:03 mins',
          style: 'Rock, Bold, Rage',
        },
        {
          id: '101',
          songName: 'Rock, Bold, Rage',
          duration: '2:03 mins',
          style: 'Rock, Bold, Rage',
        },
        {
          id: '101',
          songName: 'Rock, Bold, Rage',
          duration: '2:03 mins',
          style: 'Rock, Bold, Rage',
        },
        {
          id: '101',
          songName: 'Rock, Bold, Rage',
          duration: '2:03 mins',
          style: 'Rock, Bold, Rage',
        },
      ],
    },
    {
      id: '2',
      timestamp: '2024-01-14T09:00:00',
      prompt: 'Create a rock song to set stage on fire',
      results: [
        {
          id: '101',
          songName: 'Rock, Bold, Rage',
          duration: '2:03 mins',
          style: 'Rock, Bold, Rage',
        },
        {
          id: '101',
          songName: 'Rock, Bold, Rage',
          duration: '2:03 mins',
          style: 'Rock, Bold, Rage',
        },
        {
          id: '101',
          songName: 'Rock, Bold, Rage',
          duration: '2:03 mins',
          style: 'Rock, Bold, Rage',
        },
        {
          id: '101',
          songName: 'Rock, Bold, Rage',
          duration: '2:03 mins',
          style: 'Rock, Bold, Rage',
        },
      ],
    },
    {
      id: '3',
      timestamp: '2024-01-13T15:00:00',
      prompt: 'Create a rock song to set stage on fire',
      results: [
        {
          id: '101',
          songName: 'Rock, Bold, Rage',
          duration: '2:03 mins',
          style: 'Rock, Bold, Rage',
        },
        {
          id: '101',
          songName: 'Rock, Bold, Rage',
          duration: '2:03 mins',
          style: 'Rock, Bold, Rage',
        },
        {
          id: '101',
          songName: 'Rock, Bold, Rage',
          duration: '2:03 mins',
          style: 'Rock, Bold, Rage',
        },
        {
          id: '101',
          songName: 'Rock, Bold, Rage',
          duration: '2:03 mins',
          style: 'Rock, Bold, Rage',
        },
      ],
    },
    {
      id: '4',
      timestamp: '2024-01-02T12:00:00',
      prompt: 'Create a rock song to set stage on fire',
      results: [
        {
          id: '101',
          songName: 'Rock, Bold, Rage',
          duration: '2:03 mins',
          style: 'Rock, Bold, Rage',
        },
        {
          id: '101',
          songName: 'Rock, Bold, Rage',
          duration: '2:03 mins',
          style: 'Rock, Bold, Rage',
        },
        {
          id: '101',
          songName: 'Rock, Bold, Rage',
          duration: '2:03 mins',
          style: 'Rock, Bold, Rage',
        },
        {
          id: '101',
          songName: 'Rock, Bold, Rage',
          duration: '2:03 mins',
          style: 'Rock, Bold, Rage',
        },
      ],
    },
  ],
};

const groupSearchHistoryByDate = data => {
  const sortedData = [...data].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  const grouped = sortedData.reduce((acc, item) => {
    const date = new Date(item.timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let sectionTitle;
    if (date.toDateString() === today.toDateString()) {
      sectionTitle = '2 hours ago';
    } else if (date.toDateString() === yesterday.toDateString()) {
      sectionTitle = 'Yesterday';
    } else {
      sectionTitle = date.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
    }
    const existingSection = acc.find(section => section.title === sectionTitle);
    if (existingSection) {
      existingSection.data.push(item);
    } else {
      acc.push({
        title: sectionTitle,
        data: [item],
      });
    }

    return acc;
  }, []);

  return grouped;
};

const AIHistory = ({ setIsModalVisible, tabHeading }) => {
  const { mode } = useTheme();
  const styles = getStyles(mode);

  const sections = groupSearchHistoryByDate(searchHistoryData.searches);

  const renderItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => {
          setIsModalVisible({
            data: item,
            isVisible: true,
            tabHeading: tabHeading,
          });
        }}>
        <CView style={styles.musicIconContainer}>
          <CText style={styles.musicIcon}>♪</CText>
        </CView>
        <CText style={styles.promptText} numberOfLines={1}>
          {item.prompt}
        </CText>
      </TouchableOpacity>
    ),
    []
  );

  const renderSectionHeader = useCallback(
    ({ section: { title } }) => (
      <CText style={styles.sectionHeader}>{title}</CText>
    ),
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={item => item.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

export default AIHistory;
