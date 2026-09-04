import { forwardRef } from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const SearchInput = forwardRef(function SearchInput({ style, ...rest }, ref) {
  return (
    <Input
      ref={ref}
      allowClear
      prefix={<SearchOutlined />}
      style={{ width: 240, ...style }}
      {...rest}
    />
  );
});

export default SearchInput;
