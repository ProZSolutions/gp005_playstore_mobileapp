const ENDPOINTS = {
  AUTH: {
    LOGIN: '/mobile/login',
    LOGOUT:'/mobile/logout'
  },
  MOBILE: {
    CHECKIN:'/mobile/checkin'
  },
  CONTINUITY: {
    LINE_LIST: '/mobile/dropdown/linelist',
    STYLE_LIST: '/continuitymapping/styleListByLine',
    ORDER_DETAILS: '/continuitymapping/orderListByLineStyle',
    PROCESS: '/continuitymapping/toOrderListDropdown',
    SAVE:'/continuitymapping/createContinuityMapping'
  },
  NOTIFICATION: {
    REGISTER_TOKEN: '/register-token', // adjust path to match your backend route
  },
  AUDIT: {
  OPERATION_DEFECTS: '/audit/operation-defects',
  DEFECT_LIST:       '/audit/defect-list',
  CREATE:            '/audit/create',
  TLSAUDITLIST:       '/tlsissue/auditlist',
  QCAUDITLIST:        '/qcverification/tlsissuelist',
  TLSISSUECREATE:   '/tlsissue/create',
  MOBILEDEFECT:'/mobile/dropdown/defectlist'
},
QCVERIFICATION:{
  CREATE:           '/qcverification/create',
},
ESCALATION:{
  LIST:'/escalatedlist/escalatedlist',
  CREATE:'/escalatedlist/retrieveescalated',
},
  LINEMAPPING: {
    LIST:   '/linemapping/list',
    CREATE: '/linemapping/create',
    UPDATE: '/linemapping/update',
    DELETE: '/linemapping/delete',
    COLORS: '/linemapping/colors',
  },
  ORDERMAPPING:{
      ORDERS:'/linemapping/orderdropdown',
    OPERATIONS: '/linemapping/operationdropdown', 
  },
  DEVICEMAPPING: {
    CREATE: '/devicemapping/create',
    LIST:   '/devicemapping/list',
    CHECK:  '/mobile/dropdown/devicemappingcheck',
    REWORK_DEVICE_MAP:'/rework/reworkdevicemapping',
    REJECTION_DEVICE_MAP:'/rejection/rejectiondevicemapping',
  },

  DEVICES: {
    LIST: '/devices/list',
  },
  INPUTMODULE: {
    LIST:   '/inputmodule/list',
    CREATE: '/inputmodule/create',
    UPDATE: '/inputmodule/update',
    SHOW:   '/inputmodule/show',
    DELETE: '/inputmodule/delete',
    ORDER_SIZES: '/inputmodule/order-sizes', 
    RETURN:      '/inputmodule/return',    
  },
  CHECKING:{
    LIST:'/checking/getorderlistdropdown',
    CREATE:'/checking/checkingcreate',
    SETTINGS:'/mobile/dropdown/listsettings',
    SHOW:'/checking/show'
  },
  AQLAUDIT:{
    LIST:'/aqlaudit/getorderlistdropdown',
    INSPECTION:'/aqlaudit/inspectionleveldropdown',
    AQLLEVEL:'/aqlaudit/aqldropdown',
    DEFECTSLIST:'/aqlaudit/aqlalloweddefects',
    CREATE:'/aqlaudit/aqlcreate',
  },
  DROPDOWN: {
    LINE_LIST:          '/mobile/dropdown/linelist',
    ZONE_LIST:           '/mobile/dropdown/zonelist',
    BRANCH_LIST:         '/mobile/dropdown/branchlist',
    SHIFTLIST:          '/dropdown/shiftList',
    ZONELIST:           '/dropdown/zoneList',
    WORKSTATION:        '/dropdown/workstationList',
    STYLELIST:          '/dropdown/styleMasterList',
    OPERATIONLIST:      '/dropdown/operationMasterList',
    MACHINETYPELIST:    '/dropdown/machineTypeList',
    MACHINELIST:        '/machine/list',
    DEVICE_LIST:         '/mobile/dropdown/devicelist', 
     MACHINE_LIST:        '/mobile/dropdown/machinelist',
     LINEMAPPING:         '/audit/linemapping-dropdown',
     OPERATION:         '/audit/linemapping-operation',
     CATEGORY:   '/mobile/dropdown/categorydropdown',
     SLOT_VERIFY:         '/mobile/dropdown/slotverify',
     EMPLOYEE_LIST:'/mobile/dropdown/employeelist',
     OPERATION_LIST:'/mobile/dropdown/operationmaster',
     SEVERITY:'/mobile/dropdown/severitydropdown',
     AUTOOPERATOR :'/mobile/autooperator'
  },
  REJECTIONTRACKER:{
    LIST:'/rejectiontracker/rejectionlist',
    CREATE:'/rejectiontracker/create',
  },
  REWORKTRACKER:{
    LIST : '/reworktracker/reworklist',
    CREATE:'/reworktracker/create'
  },
  REWORK: {
    ORDER_DROPDOWN: '/rework/orderdropdown',
    WIPBAL :'/rework/wipbal',
    CREATE:'/rework/create',
    QRCODE:'/mobile/dropdown/reworkqrlist',
    REJQRCODE:'/mobile/dropdown/rejectionqrlist'
  },
   REJECTION: {
    ORDER_DROPDOWN: '/rejection/orderdropdown',
    WIPBAL :'/rejection/wipbal',
    CREATE:'/rejection/create',
  },
  TLSLINE: {
     LINES:        '/dropdown/lineList',          
    ORDERLIST:    '/dropdown/orderMasterList',    
    COLORLIST:    '/linemapping/colors',         
    WORKSTATION:  '/dropdown/workstationList',   
    STYLELIST:    '/dropdown/styleMasterList',  
    MACHINELIST:  '/dropdown/machineTypeList',   
    BUYERDETAILS: '/dropdown/buyerDetails',
    OPERATIONLIST:'/mobile/operationList',
    LINEMAPPING:  '/mobile/lineMappingSave',
  },

  OPERATION_BULLETIN: {
    CREATE:    '/operation-bulletin/create',
    UPDATE:    '/operation-bulletin/update',
    DELETE:    '/operation-bulletin/delete',
    GET_BY_ID: '/operation-bulletin/getById',
    LIST:      '/operation-bulletin/list',
    DROPDOWN:  '/operation-bulletin/dropdown',
    STYLE_SAM: '/operation-bulletin/styleWithSam',
  },

  OPERATION: {
    LOAD: '/operation/load',
  },

  STYLE: {
    LIST:   '/style/list',
    CREATE: '/style/create',
    UPDATE: '/style/update',
    DELETE: '/style/delete',
  },
};

export default ENDPOINTS;