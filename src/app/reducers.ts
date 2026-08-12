import { combineReducers } from '@reduxjs/toolkit';



import authReducer from 'features/Auth/store/authSlice';
import backupReducer from 'features/BackupRestore/store/backupSlice';
import certReducer from 'features/CertificateStore/store/certificateSlice';
import configReducer from 'features/Config/store/configSlice';
import destinationReducer from 'features/Destination/store/destinationSlice';
import eventMonitorReducer from 'features/EventMonitor/store/eventMonitorSlice';
import jobReducer from 'features/BackgroundJobs/store/jobsSlice';
import logViewerReducer from 'features/LogViewer/store/logViewerSlice';
import paginationReducer from 'common/pagination/paginationSlice';
import servicesStatusReducer from 'common/servicesStatus/servicesStatusSlice';
import sourceReducer from 'features/Source/store/sourceSlice';
import syslogReducer from 'features/Syslog/store/syslogSlice';
import systemConfigReducer from 'features/SystemConfiguration/store/configSlice';
import systemReducer from 'features/SystemInfo/store/systemSlice'
import transformReducer from 'features/Transform/store/transformSlice';
import updatesReducer from 'features/Updates/store/updatesSlice';
import userReducer from 'features/Users/store/userSlice';
import vpnReducer from 'features/VPNClient/store/vpnSlice';
import wecReducer from 'features/WecSubscription/store/wecSlice';

export default combineReducers({
  auth: authReducer,
  backup: backupReducer,
  certs: certReducer,
  config: configReducer,
  destination: destinationReducer,
  eventMonitor: eventMonitorReducer,
  jobs: jobReducer,
  logViewer: logViewerReducer,
  pagination: paginationReducer,
  servicesStatus: servicesStatusReducer,
  source: sourceReducer,
  syslog: syslogReducer,
  system: systemReducer,
  systemConfig: systemConfigReducer,
  transform: transformReducer,
  updates: updatesReducer,
  user: userReducer,
  vpn: vpnReducer,
  wec: wecReducer,
});
