import React, { useState } from "react";
import { Select, Flex } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";

/**
 * EditableTagSelect - Select dạng tags cho phép admin:
 *   - Chọn từ danh sách gợi ý có sẵn
 *   - Thêm giá trị tùy ý (gõ Enter)
 *   - Xóa option khỏi danh sách gợi ý (✕ bên cạnh từng option, persist qua localStorage)
 *   - Chỉ cho phép chọn 1 giá trị tại một thời điểm
 *
 * Props:
 *   storageKey    (string)   - key dùng để lưu vào localStorage, phải unique
 *   defaultOptions (string[]) - danh sách giá trị mặc định
 *   value         (string)   - giá trị hiện tại (từ Form.Item)
 *   onChange      (fn)       - callback khi giá trị thay đổi (từ Form.Item)
 *   placeholder   (string)   - placeholder text
 */
const EditableTagSelect = ({
  storageKey,
  defaultOptions = [],
  value,
  onChange,
  placeholder = "Chọn hoặc nhập giá trị mới",
}) => {
  // Load danh sách option từ localStorage, fallback về defaultOptions
  const [options, setOptions] = useState(() => {
    try {
      const saved = localStorage.getItem(`option_presets_${storageKey}`);
      return saved ? JSON.parse(saved) : [...defaultOptions];
    } catch {
      return [...defaultOptions];
    }
  });

  // Xóa một option khỏi danh sách gợi ý (persist vào localStorage)
  const removeOption = (optValue) => {
    const newOpts = options.filter((o) => o !== optValue);
    setOptions(newOpts);
    try {
      localStorage.setItem(
        `option_presets_${storageKey}`,
        JSON.stringify(newOpts)
      );
    } catch {}
    // Nếu option bị xóa đang được chọn, clear form value
    if (value === optValue) {
      onChange?.(undefined);
    }
  };

  // Xử lý khi người dùng chọn/nhập giá trị
  const handleChange = (selectedArr) => {
    // Chỉ giữ giá trị cuối cùng (single-select behavior)
    const last = selectedArr[selectedArr.length - 1];
    onChange?.(last ?? undefined);

    // Nếu nhập giá trị mới chưa có trong danh sách, thêm vào và persist
    if (last && !options.includes(last)) {
      const newOpts = [...options, last];
      setOptions(newOpts);
      try {
        localStorage.setItem(
          `option_presets_${storageKey}`,
          JSON.stringify(newOpts)
        );
      } catch {}
    }
  };

  return (
    <Select
      mode="tags"
      value={value ? [value] : []}
      onChange={handleChange}
      placeholder={placeholder}
      className="w-full"
      tokenSeparators={[]}
      // Render custom từng option trong dropdown
      optionRender={(opt) => (
        <Flex
          justify="space-between"
          align="center"
          style={{ padding: "2px 0", minHeight: 24 }}
        >
          <span style={{ flex: 1 }}>{opt.label}</span>
          {/* Không hiện ✕ nếu option đang được chọn */}
          {opt.value !== value && (
            <CloseCircleOutlined
              style={{ color: "#ccc", fontSize: 13, flexShrink: 0, marginLeft: 8 }}
              title="Xóa khỏi danh sách"
              onMouseDown={(e) => {
                // preventDefault ngăn Select chọn option này khi click xóa
                e.preventDefault();
                e.stopPropagation();
                removeOption(opt.value);
              }}
            />
          )}
        </Flex>
      )}
      options={options.map((opt) => ({ value: opt, label: opt }))}
    />
  );
};

export default EditableTagSelect;
