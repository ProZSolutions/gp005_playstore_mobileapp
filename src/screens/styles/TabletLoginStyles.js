import { StyleSheet } from 'react-native';
import { AppColors } from '../../theme/theme';
import Dimensions from '../../theme/dimensions'; 
const TabletLoginStyles = StyleSheet.create({ 
  heroWrapper: {
    height: 320,
    maxHeight: '34%',
  }, 
  card: {
    paddingHorizontal: 40,
    paddingTop: 28,
    paddingBottom: 32,
  },

  title: {
    fontSize: 26,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 24,
  },

  forgotRow: {
    marginTop: 8,
    marginBottom: 20,
  },
  forgot_title: {
    fontSize: 20,
  },

  helpContainer: {
    marginTop: 22,
  },
  helpText: {
    fontSize: 20.5,
  },
  contactText: {
    fontSize: 20.5,
    marginLeft: 6,
  },
});

export default TabletLoginStyles;