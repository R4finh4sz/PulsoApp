import { ErrorBoundaryProps, Link } from 'expo-router';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ErrorBoundary = ({ error, retry }: ErrorBoundaryProps) => {
  return (
    <View style={[styles.container]}>
      <SafeAreaView
        style={{ flex: 1, maxWidth: 720, marginHorizontal: 'auto' }}
      >
        <View
          style={{
            marginBottom: 12,
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={styles.title}>Algo deu errado</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable>
              <TouchableOpacity onPress={retry}>
                <View
                  style={[
                    {
                      paddingVertical: 12,
                      paddingHorizontal: 24,
                      borderColor: 'white',
                      borderWidth: 2,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      {
                        color: 'white',
                      },
                    ]}
                  >
                    Recarregar
                  </Text>
                </View>
              </TouchableOpacity>
            </Pressable>
          </View>
        </View>

        <StackTrace error={error} />

        {process.env.NODE_ENV === 'development' && (
          <Link href={'/_sitemap' as '/'} style={styles.link}>
            Sitemap
          </Link>
        )}
      </SafeAreaView>
    </View>
  );
};

const StackTrace = ({ error }: { error: Error }) => {
  return (
    <ScrollView
      contentContainerStyle={{
        padding: 12,
      }}
      style={{
        marginVertical: 8,
        borderColor: 'rgba(255,255,255,0.5)',
        borderWidth: 1,
      }}
    >
      <Text style={[styles.code, { color: 'white' }]}>{error.stack}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 24,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  title: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  code: {
    fontFamily: Platform.select({
      default: 'Courier',
      ios: 'Courier New',
      android: 'monospace',
    }),
    fontWeight: '500',
  },
  subtitle: {
    color: 'white',
    fontSize: 14,
    marginBottom: 12,
    // textAlign: "center",
  },
  link: {
    color: 'rgba(255,255,255,0.4)',
    textDecorationStyle: 'solid',
    textDecorationLine: 'underline',
    fontSize: 14,
    textAlign: 'center',
  },
});
