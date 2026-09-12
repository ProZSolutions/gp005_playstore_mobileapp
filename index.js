import './disableFontScaling';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { applyGlobalFont } from './src/theme/applyGlobalFont';

applyGlobalFont(); // ← this line was missing

AppRegistry.registerComponent(appName, () => App);