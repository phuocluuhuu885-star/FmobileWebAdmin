import React from "react";
import { Button, Dropdown, Modal } from "antd";

const ButtonSelected = ({ items, icon }) => {
  return (
    <>
      <Dropdown
        menu={{ items }}
        arrow={{
          pointAtCenter: true,
        }}
        trigger={["click"]}
      >
        <Button onClick={(e) => e.preventDefault()} icon={icon} />
      </Dropdown>
    </>
  );
};

export default ButtonSelected;
