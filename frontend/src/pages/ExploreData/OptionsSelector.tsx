import React from "react";
import ArrowDropUp from "@material-ui/icons/ArrowDropUp";
import ArrowDropDown from "@material-ui/icons/ArrowDropDown";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { Fips } from "../../data/utils/Fips";
import Popover from "@material-ui/core/Popover";
import Button from "@material-ui/core/Button";
import styles from "./OptionsSelector.module.scss";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { usePopover } from "../../utils/usePopover";

function OptionsSelector(props: {
  value: string;
  options: Fips[] | string[][];
  onOptionUpdate: (option: string) => void;
}) {
  const popover = usePopover();

  const isFips =
    props.options[0] && props.options[0] instanceof Fips ? true : false;
  let currentDisplayName;
  if (isFips) {
    currentDisplayName = new Fips(props.value).getFullDisplayName();
  } else {
    const chosenOption = (props.options as string[][]).find(
      (i: string[]) => i[0] === props.value
    );
    currentDisplayName = chosenOption ? chosenOption[1] : "";
  }

  return (
    <>
      <Button
        variant="text"
        className={styles.MadLibButton}
        onClick={popover.open}
      >
        {currentDisplayName}
        {popover.isOpen ? <ArrowDropUp /> : <ArrowDropDown />}
      </Button>
      <Popover
        open={popover.isOpen}
        anchorEl={popover.anchor}
        onClose={popover.close}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        {isFips && (
          <div className={styles.OptionsSelectorPopover}>
            <span className={styles.SearchForText}>Search for location</span>
            <Autocomplete
              disableClearable={true}
              options={props.options as Fips[]}
              clearOnEscape={true}
              getOptionLabel={(fips) => fips.getFullDisplayName()}
              getOptionSelected={(fips) => fips.code === props.value}
              renderOption={(fips) => <>{fips.getFullDisplayName()}</>}
              renderInput={(params) => (
                <TextField
                  placeholder="County, State, Territory, or United States" // TODO- update depending on what options are
                  margin="dense"
                  variant="outlined"
                  {...params}
                />
              )}
              onChange={(e, fips) => {
                props.onOptionUpdate(fips.code);
                popover.close();
              }}
            />
            <span className={styles.NoteText}>
              City and census tract location is currently unavailable
            </span>
          </div>
        )}
        {!isFips && (
          <List>
            {(props.options as string[][]).map((item: string[]) => (
              <ListItem
                button
                selected={item[0] === props.value}
                onClick={() => {
                  popover.close();
                  props.onOptionUpdate(item[0]);
                }}
              >
                <ListItemText primary={item[1]} />
              </ListItem>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
}

export default OptionsSelector;
