import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Logo / title */}
        <View style={styles.logoArea}>
          <Text style={styles.logoText}>2048</Text>
          <Text style={styles.tagline}>タイルを合体させて 2048 を目指せ！</Text>
        </View>

        {/* Buttons */}
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => navigation.navigate('Game')}
          activeOpacity={0.85}
        >
          <Text style={styles.startBtnText}>ゲームスタート</Text>
        </TouchableOpacity>

        {/* How to play */}
        <View style={styles.howTo}>
          <Text style={styles.howToTitle}>遊び方</Text>
          <Text style={styles.howToText}>
            上下左右にスワイプしてタイルを動かしましょう。{'\n'}
            同じ数字のタイルがぶつかると合体して 2 倍になります。{'\n'}
            2048 のタイルを作ればクリア！
          </Text>
        </View>

        {/* Stage overview */}
        <View style={styles.stages}>
          <Text style={styles.stagesTitle}>ステージ一覧</Text>
          {[
            { id: 1, tile: 64 },
            { id: 2, tile: 128 },
            { id: 3, tile: 256, note: '★課金ポイント' },
            { id: 4, tile: 512 },
            { id: 5, tile: 1024, note: '★課金ポイント' },
            { id: 6, tile: 2048 },
          ].map((s) => (
            <View key={s.id} style={styles.stageRow}>
              <Text style={styles.stageLabel}>
                Stage {s.id}: {s.tile.toLocaleString()} タイル到達
              </Text>
              {s.note && <Text style={styles.stageNote}>{s.note}</Text>}
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAF8EF',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 72,
    fontWeight: '800',
    color: '#776E65',
    letterSpacing: -2,
  },
  tagline: {
    fontSize: 15,
    color: '#9F8B7A',
    marginTop: 4,
    textAlign: 'center',
  },
  startBtn: {
    backgroundColor: '#8F7A66',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 56,
    marginBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  startBtnText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  howTo: {
    backgroundColor: '#EEE4DA',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  howToTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#776E65',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  howToText: {
    fontSize: 14,
    color: '#776E65',
    lineHeight: 22,
  },
  stages: {
    width: '100%',
  },
  stagesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#776E65',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D8CCC4',
  },
  stageLabel: {
    flex: 1,
    fontSize: 14,
    color: '#776E65',
  },
  stageNote: {
    fontSize: 12,
    color: '#F59563',
    fontWeight: '600',
  },
});
