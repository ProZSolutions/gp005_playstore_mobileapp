 import { StyleSheet, Platform, Dimensions } from 'react-native';
import { AppColors } from '../../theme/theme';

const { width: W } = Dimensions.get('window');
const H_PAD = Math.min(Math.max(W * 0.042, 14), 20);
const TEAL  = AppColors.primary ?? '#0A9E96';

export default StyleSheet.create({
  safe: {
    flex:            1,
    backgroundColor: TEAL,
  }, 
 
   header: {
    backgroundColor:   TEAL,
    paddingHorizontal: H_PAD,
    paddingTop:        Platform.OS === 'android' ? 10 : 4,
    paddingBottom:     0,
  },

   headerRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  zoneDropdownBtn: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
  },
  zoneBG:{
  textAlign:'center',
    backgroundColor: AppColors.transparentBG,
    justifyContent:'center',
    alignItems:'center',
    borderRadius:4,
    padding:4
  },
   
  zoneIcon: {
    fontSize: 15,
    color:    '#fff',
     },
  zoneDropdownText: {
    fontSize:   16,
    fontWeight: '600',
    color:      '#fff',
    marginRight: 2,
  },
  zoneChevron: {
    fontSize: 12,
    color:    'rgba(255,255,255,0.80)',
  },
  bellBtn: {
    padding: 4,
  },
  bellIcon: {
    fontSize: 21,
    color:    '#fff',
  },

   lineFilterScroll: {
    paddingHorizontal: H_PAD,
    paddingBottom:     10,
  },
  lineFilterContent: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
    paddingRight:  H_PAD,
  },
  filterChip: {
    borderRadius:    20,
    paddingHorizontal: 14,
    paddingVertical:   6,
    borderWidth:     1.5,
    borderColor:     'rgba(255,255,255,0.50)',
    backgroundColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: '#fff',
    borderColor:     '#fff',
  },
  filterChipText: {
    fontSize:   13,
    fontWeight: '500',
    color:      'rgba(255,255,255,0.85)',
  },
  filterChipTextActive: {
    color:      TEAL,
    fontWeight: '700',
    
  },
  body: {
    flex:                 1,
    backgroundColor:      '#F2F5F5',
    borderTopLeftRadius:  20,
    borderTopRightRadius: 20,
    overflow:             'hidden',
  },

   totalBar: {
    backgroundColor:   '#fff',
    paddingHorizontal: H_PAD,
    paddingVertical:   10,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
  },
  totalText: {
    fontSize:   14,
    fontWeight: '500',
    color:      '#7A9090',
  },
  totalCount: {
    fontWeight: '700',
    color:      AppColors.onSurfaceVariant,
  },

  // Workstation list
  listContent: {
    paddingBottom: 12,
  },

  // Workstation row card
  wsRow: {
    flexDirection:   'row',
    alignItems:      'stretch',
    backgroundColor: '#fff',
    marginHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingVertical:  14,
    paddingRight:     H_PAD,
  },
  // Left teal accent bar
  wsAccent: {
    width:        3,
    borderRadius: 2,
    backgroundColor: TEAL,
    marginLeft:   H_PAD,
    marginRight:  12,
    alignSelf:    'stretch',
  },
  wsBody: {
    flex: 1,
  },
  wsName: {
    fontSize:     15,
    fontWeight:   '600',
    color:        '#1A2E2D',
    marginBottom: 3,
  },
  wsMeta: {
    flexDirection: 'row',
    alignItems:    'center',
    flexWrap:      'wrap',
    gap:           4,
  },
  wsLineName: {
    fontSize:   13,
    fontWeight: '600',
    color:      TEAL,
  },
  wsDot: {
    fontSize: 12,
    color:    '#AEAEAE',
  },
  wsTls: {
    fontSize: 13,
    color:    '#7A9090',
  },
  wsNum: {
    fontSize: 13,
    color:    '#7A9090',
  },

  // Skeleton placeholder rows
  skeletonRow: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingRight:    H_PAD,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  skeletonAccent: {
    width:        3,
    height:       38,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    marginLeft:   H_PAD,
    marginRight:  12,
  },
  skeletonBody: { flex: 1 },
  skeletonTitle: {
    height:       13,
    width:        '50%',
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonSub: {
    height:       11,
    width:        '70%',
    backgroundColor: '#EFEFEF',
    borderRadius: 4,
  },

  // Zone dropdown modal overlay
  modalOverlay: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent:  'flex-start',
  },
  dropdown: {
    backgroundColor:   '#fff',
    marginHorizontal:  H_PAD,
    marginTop:         Platform.OS === 'ios' ? 100 : 80,
    borderRadius:      14,
    paddingVertical:   6,
    ...Platform.select({
      ios: {
        shadowColor:   '#000',
        shadowOffset:  { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius:  14,
      },
      android: { elevation: 10 },
    }),
  },
  dropdownItem: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingVertical: 12,
    paddingHorizontal: H_PAD,
    gap:             10,
  },
  dropdownItemBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  dropdownItemText: {
    flex:       1,
    fontSize:   15,
    fontWeight: '500',
    color:      '#1A2E2D',
  },
  dropdownItemTextActive: {
    color:      TEAL,
    fontWeight: '700',
  },
  dropdownCheck: {
    fontSize: 15,
    color:    TEAL,
    fontWeight: '800',
  },
  dropdownItemSub: {
    fontSize: 13,
    color:    '#9AACAC',
  },

  // Empty state
  emptyContainer: {
    alignItems:  'center',
    paddingTop:  60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize:     41,
    marginBottom: 12,
  },
  emptyText: {
    fontSize:   15,
    color:      '#7A9090',
    textAlign:  'center',
    lineHeight: 20,
  },
});