import * as _ from "underscore";
import * as React from "react";
import { IFormInputHTMLProps } from "../form";
import { Icon } from "./../../display/icon";
import { ValidationLabel } from "../validationWrapper";
import { ClassHelpers } from "../../../utilities/classNames";

export interface ITextInputProps extends IFormInputHTMLProps<TextInput> {
  multiLine?: boolean;
  readonly?: boolean;
  rightOverlayText?: string | React.ReactElement<any>;
  leftOverlayText?: string | React.ReactElement<any>;
  type?: string;
  leftIcon?: string;
  rightIcon?: string;
}

export class TextInput extends React.Component<ITextInputProps, {}> {
  static defaultProps = {
    validationMode: "none"
  }
  public input: HTMLInputElement | HTMLTextAreaElement;
  public focus() {
    if (this.input) {
      this.input.focus()
    }
  }
  public blur() {
    if (this.input) {
      this.input.blur()
    }
  }
  render() {
    const validationMessage = this.props["data-validation-message"]
    var classes = ClassHelpers.classNames(
      "armstrong-input",
      "text-input",
      this.props.className,
      {
        "text-input-disabled": this.props.disabled,
        "has-text-overlay-right": this.props.rightOverlayText !== undefined,
        "has-text-overlay-left": this.props.leftOverlayText !== undefined,
        "text-input-icon-left": this.props.leftIcon !== undefined,
        "text-input-icon-right": this.props.rightIcon !== undefined,
        "show-validation": (this.props.validationMode !== "none" && validationMessage)
      }
    );
    var ps = _.omit(this.props, "className", "readonly", "rightOverlayText", "leftOverlayText", "type", "leftIcon", "rightIcon", "multiLine", "validationMode")
    return (
      <div className={classes} title={validationMessage}>
        {this.props.leftIcon && <Icon className="left-icon" icon={this.props.leftIcon} />}
        {this.props.leftOverlayText && <div className="input-overlay-text-left">{this.props.leftOverlayText}</div>}
        {!this.props.multiLine && <input ref={r => this.input = r} type={this.props.type || "text"} readOnly={this.props.readonly} {...ps} placeholder={this.props.placeholder} required={this.props.required} />}
        {this.props.multiLine && <textarea ref={r => this.input = r} readOnly={this.props.readonly} {...ps} placeholder={this.props.placeholder} />}
        {this.props.rightOverlayText && <div className="input-overlay-text-right">{this.props.rightOverlayText}</div>}
        {this.props.rightIcon && <Icon className="right-icon" icon={this.props.rightIcon} />}
        {this.props.children}
        <ValidationLabel message={validationMessage} mode={this.props.validationMode} />
      </div>
    );
  }
}