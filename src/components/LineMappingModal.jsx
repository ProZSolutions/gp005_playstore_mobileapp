// components/LineMappingModal.js

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import { AppButton } from './AppButton';
import { AppColors } from '../theme/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

 
const FieldLabel = ({ children, required }) => (
  <Text style={styles.label}>
    {children}
    {required && <Text style={styles.required}> *</Text>}
  </Text>
);
 
const DropdownField = ({ label, required, value, placeholder, onPress, disabled }) => (
  <View style={styles.fieldGroup}>
    <FieldLabel required={required}>{label}</FieldLabel>

    <TouchableOpacity
      style={[styles.dropdown, disabled && styles.dropdownDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text
        style={[styles.dropdownText, !value && styles.placeholderText]}
        numberOfLines={1}
      >
        {value ?? placeholder}
      </Text>
      <Icon name="keyboard-arrow-down" size={20} color="#777" />
    </TouchableOpacity>
  </View>
);

/**
 * ------------------------------------------------------------
 * BOTTOM PICKER SHEET
 * ------------------------------------------------------------
 */
const PickerSheet = ({ visible, title, items = [], labelKey = 'name', onSelect, onClose,showSearch = true, }) => {
  const [search, setSearch] = useState('');

  // Reset search whenever sheet opens
  useEffect(() => {
    if (visible) setSearch('');
  }, [visible]);
 const filteredItems = useMemo(() => {
  // if search disabled return all items
  if (!showSearch) {
    return items;
  }

  if (!search.trim()) {
    return items;
  }

  const q = search.toLowerCase();

  return items.filter(item =>
    String(
      item?.[labelKey] ?? '',
    )
      .toLowerCase()
      .includes(q),
  );
}, [
  items,
  search,
  labelKey,
  showSearch,
]);

  if (!visible) return null;

  return (
    <View style={styles.sheetOverlay}>
      <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />

      <View style={styles.sheet}>
        <View style={styles.dragger} />

        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
      {showSearch && (
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search..."
                placeholderTextColor="#999"
                style={styles.searchInput}
              />
      )}
        <FlatList
          data={filteredItems}
          keyExtractor={(item, i) => String(item.id ?? item[labelKey] ?? i)}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.sheetItem}
              onPress={() => {
                onSelect(item);
                onClose();
              }}
            >
              <Text style={styles.sheetItemText}>{item[labelKey]}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <Text style={styles.empty}>No records found</Text>
          )}
        />
      </View>
    </View>
  );
};

/**
 * ------------------------------------------------------------
 * MAIN MODAL
 * ------------------------------------------------------------
 */
export default function LineMappingModal({
  visible,
  mode = 'add',       // 'add' | 'edit'
  loading = false,

  formData = {},
  onChange,

  onSave,
  onClose,

  lineList = [],
  orderList = [],
  styleList = [],
  machineList = [],
  colorList = [],
  workStationList = [],
  tlsList = [], // add this
  onLineChange,
  onOrderChange,
 }) {
  const isEdit = mode === 'edit';

  const [activePicker, setActivePicker] = useState(null);

  const title = isEdit ? 'Update TLS ID' : 'Add Line Mapping';

  useEffect(() => {
    if (!visible) setActivePicker(null);
  }, [visible]);

   return (
  <Modal
    visible={visible}
    animationType="slide"
    statusBarTranslucent
  >
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.fullContainer}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.backBtn}
          >
            <Icon
              name="arrow-back-ios-new"
              size={22}
              color="#FFF"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {title}
          </Text>

          {/* spacer for center align */}
          <View style={{ width: 40 }} />
        </View>

        {/* FORM */}
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.formContainer}
        >
          {/* LINE */}
          <DropdownField
            label="Line"
            required
            disabled={isEdit}
            value={formData?.line?.line_name}
            placeholder="Select Line"
            onPress={() => setActivePicker('line')}
          />

          {/* ORDER */}
          <DropdownField
            label="Order"
            required
            disabled={isEdit || !formData?.line}
            value={formData?.order?.order_code}
            placeholder="Select Order"
            onPress={() => setActivePicker('order')}
          />

          {/* STYLE */}
          <DropdownField
            label="Style"
            required
            disabled={isEdit}
            value={formData?.style?.style_name}
            placeholder="Select Style"
            onPress={() => setActivePicker('style')}
          />

          {/* MACHINE */}
          <DropdownField
            label="Machine"
            required
            disabled={isEdit}
            value={formData?.machine?.machine_name}
            placeholder="Select Machine"
            onPress={() => setActivePicker('machine')}
          />

          {/* COLOR */}
          <DropdownField
            label="Color"
            required
            disabled={isEdit}
            value={formData?.color?.colour_name}
            placeholder="Select Color"
            onPress={() => setActivePicker('color')}
          />

          {/* TLS ID */}
        <DropdownField
        label="TLS ID"
        required
        disabled={false}
        value={formData?.tls?.code}
        placeholder="Select TLS ID"
        onPress={() =>
          setActivePicker('tls')
        }
      />

          {/* WORKSTATION */}
          <DropdownField
            label="Workstation"
            required={!isEdit}
            disabled={isEdit}
            value={
              formData?.workstation?.name
            }
            placeholder="Select Workstation"
            onPress={() =>
              setActivePicker(
                'workstation',
              )
            }
          />
        </ScrollView>

        {/* FOOTER */}
        <View style={styles.footer}>
          <AppButton
            label="Cancel"
            variant="outline"
            style={styles.btn}
            onPress={onClose}
          />

          <AppButton
            label={
              loading
                ? 'Saving...'
                : isEdit
                ? 'Update'
                : 'Save'
            }
            loading={loading}
            disabled={loading}
            style={styles.btn}
            onPress={onSave}
          />
        </View>
      </View>

      {/* PICKERS */}
      <PickerSheet
        visible={activePicker === 'line'}
        title="Select Line"
        items={lineList}
         showSearch={false}
        labelKey="line_name"
        onSelect={item => {
          onLineChange(item);
          onChange('line', item);
        }}
        onClose={() =>
          setActivePicker(null)
        }
      />

      <PickerSheet
        visible={activePicker === 'order'}
        title="Select Order"
        items={orderList}
         showSearch={false}
        labelKey="order_code"
        onSelect={item => {
          onOrderChange(item);
          onChange('order', item);
        }}
        onClose={() =>
          setActivePicker(null)
        }
      />

      <PickerSheet
        visible={activePicker === 'style'}
        title="Select Style"
        items={styleList}
         showSearch={false}
        labelKey="style_name"
        onSelect={item =>
          onChange('style', item)
        }
        onClose={() =>
          setActivePicker(null)
        }
      />

      <PickerSheet
        visible={
          activePicker === 'machine'
        }
        title="Select Machine"
        items={machineList}
         showSearch={false}
        labelKey="machine_name"
        onSelect={item =>
          onChange('machine', item)
        }
        onClose={() =>
          setActivePicker(null)
        }
      />

      <PickerSheet
        visible={activePicker === 'color'}
        title="Select Color"
        items={colorList}
         showSearch={false}
        labelKey="colour_name"
        onSelect={item =>
          onChange('color', item)
        }
        onClose={() =>
          setActivePicker(null)
        }
      />

      <PickerSheet
        visible={
          activePicker ===
          'workstation'
        }
        title="Select Workstation"
        items={workStationList}
         showSearch={false}
        labelKey="name"
        onSelect={item =>
          onChange(
            'workstation',
            item,
          )
        }
        onClose={() =>
          setActivePicker(null)
        }
      />

      <PickerSheet
        visible={activePicker === 'tls'}
        title="Select TLS ID"
        items={tlsList}
        showSearch={false}
        labelKey="code"
        onSelect={item =>
          onChange('tls', item)
        }
        onClose={() =>
          setActivePicker(null)
        }
  />
    </KeyboardAvoidingView>
  </Modal>
);
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  container: {
    backgroundColor: AppColors.surface || '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    maxHeight: '90%',
  },

  dragger: {
    width: 60,
    height: 5,
    backgroundColor: '#DDD',
    borderRadius: 999,
    alignSelf: 'center',
    marginBottom: 16,
  },
headerTitle: {
  flex: 1,
  fontSize: 15,
  fontWeight: '700',
  color: '#FFF',
  marginLeft: 10,
},
formContainer: {
  padding: 18,
  paddingBottom: 120,
},
  header: {
  backgroundColor: AppColors.primary,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 18,
  paddingTop:
    Platform.OS === 'ios'
      ? 60
      : 18,
      paddingTop:50,
  paddingBottom: 18,
  elevation: 6,
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },

  closeText: {
    fontSize: 20,
    color: '#777',
  },

  fieldGroup: {
    marginBottom: 18,
  },

  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
     textTransform: 'uppercase',
    color: AppColors.textSecondary,
  },

  required: {
    color: '#E53935',
  },

  dropdown: {
    borderWidth: 1,
  borderColor: '#E3E6EB',
  borderRadius: 14,
  minHeight: 45,
  paddingHorizontal: 16,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#FFF',
  },

  dropdownDisabled: {
    opacity: 0.65,
  },

  dropdownText: {
    flex: 1,
    color: AppColors.textPrimary,
    fontSize: 12,
  },

  placeholderText: {
    color: '#AAA',
  },

  chevron: {
    fontSize: 14,
    color: '#888',
  },
fullContainer: {
  flex: 1,
  backgroundColor: '#F7F8FA',
},
  input: {
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 12,
    minHeight: 45,
    paddingHorizontal: 14,
    color: AppColors.textPrimary,
    backgroundColor: '#FFF',
    fontSize:12,
     color: '#111',
  },

  footer: {
    flexDirection: 'row',
  paddingHorizontal: 18,
  paddingVertical: 14,
  backgroundColor: '#FFF',
  borderTopWidth: 1,
  borderTopColor: '#EEE',
  },

  btn: {
    flex: 1,
    marginHorizontal: 5,
  },

  sheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },

  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
    maxHeight: '80%',
  },

  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  searchInput: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: '#E5E5E5',
    paddingHorizontal: 14,
    height: 48,
  },

  sheetItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },

  sheetItemText: {
    fontSize: 15,
    color: '#222',
  },

  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#888',
  },
});