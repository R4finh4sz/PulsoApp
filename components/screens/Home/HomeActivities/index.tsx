import { BookOpen, Calculator } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { HomeActivity } from '@/components/screens/Home/mock';
import Pressable from '@/components/ui/Pressable';
import { getDeadlineColor } from '@/utils/getDeadlineColor';

type Props = { activities: HomeActivity[]; onViewAll?: () => void };

export const HomeActivities = ({ activities, onViewAll }: Props) => {
  const visibleActivities = activities.slice(0, 3);

  return (
    <View>
      <View
        className="flex-row items-center justify-between"
        style={{ gap: 8, marginBottom: 12 }}
      >
        <Text
          className="font-poppins_medium text-base"
          style={{ color: '#253044', flex: 1 }}
        >
          Atividades em aberto
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !onViewAll }}
          disabled={!onViewAll}
          style={{ minHeight: 44, justifyContent: 'center', paddingLeft: 8 }}
          onPress={onViewAll}
        >
          <Text className="font-poppins text-xs" style={{ color: '#0095B3' }}>
            Ver tudo
          </Text>
        </Pressable>
      </View>

      <View style={{ gap: 18 }}>
        {visibleActivities.map(activity => (
          <View
            key={activity.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              backgroundColor: '#E6FBFF',
              padding: 14,
              borderRadius: 18,
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.09,
              shadowRadius: 5,
              elevation: 3,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor:
                  activity.kind === 'reading' ? '#F3EDFF' : '#E6FBFF',
              }}
            >
              {activity.kind === 'reading' ? (
                <BookOpen color="#A066FF" size={22} strokeWidth={1.5} />
              ) : (
                <Calculator color="#009DBD" size={22} strokeWidth={1.5} />
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text
                className="font-poppins_medium"
                style={{ color: '#253044', fontSize: 13 }}
              >
                {activity.title}
              </Text>

              <Text
                className="font-poppins"
                style={{ color: '#71849D', fontSize: 11, marginTop: 2 }}
              >
                {`${activity.subject} · ${activity.teacher}`}
              </Text>
            </View>

            <Text
              className="font-poppins_medium"
              style={{
                fontSize: 10,
                color: getDeadlineColor(activity.daysLeft),
              }}
            >
              {activity.daysLeft} dias
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
