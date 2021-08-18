import { Box, makeStyles } from "@material-ui/core";
import React, { useContext } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import {
  completeGoal,
  deleteGoal,
  OperatorGoalState,
  reorderGoal,
  toggleFocus,
} from "../store/goalsSlice";
import { useAppDispatch, useAppSelector } from "../store/store";
import { operatorGoalIngredients } from "../utils";
import OperatorGoalCard from "./OperatorGoalCard";
import PlannerContext from "./PlannerContext";

const useStyles = makeStyles({
  goalList: {
    padding: 0,
  },
  droppable: {
    "& > li": {
      "list-style-type": "none",
    },
  },
});

const GoalList: React.VFC = () => {
  const dispatch = useAppDispatch();
  const goals = useAppSelector((state) => state.goals);
  const { operatorMap } = useContext(PlannerContext);
  const classes = useStyles();

  const handleDeleteGoal = (opGoal: OperatorGoalState) => {
    dispatch(deleteGoal(opGoal));
  };

  const handleCompleteGoal = (opGoal: OperatorGoalState) => {
    dispatch(
      completeGoal({
        ...opGoal,
        ingredients: operatorGoalIngredients(opGoal, operatorMap),
      })
    );
  };

  const handleToggleFocus = (opGoal: OperatorGoalState) => {
    dispatch(toggleFocus(opGoal));
  };

  const sortedGoals = goals.operators
    .map((opGoal, i) => ({ ...opGoal, originalIndex: i }))
    .sort((a, b) => (b.focused ? 1 : 0) - (a.focused ? 1 : 0));
  const focusedGoals = sortedGoals.filter((opGoal) => opGoal.focused);
  const unfocusedGoals = sortedGoals.filter((opGoal) => !opGoal.focused);

  const handleDragEnd = (result: DropResult) => {
    if (
      result.destination &&
      result.source.droppableId === result.destination.droppableId
    ) {
      const list = result.source.droppableId.startsWith("focused")
        ? focusedGoals
        : unfocusedGoals;
      dispatch(
        reorderGoal({
          oldIndex: list[result.source.index].originalIndex,
          newIndex: list[result.destination.index].originalIndex,
        })
      );
    }
  };

  const renderList = (
    list: (OperatorGoalState & { originalIndex: number })[],
    focused: boolean
  ) => (
    <>
      <h3>{focused ? "Focused" : "Other"} goals</h3>
      <Droppable droppableId={`${focused ? "focused-" : ""}goal-list`}>
        {(droppableProvided) => (
          <div
            {...droppableProvided.droppableProps}
            ref={droppableProvided.innerRef}
            className={classes.droppable}
          >
            <ol className={classes.goalList}>
              {list.map((opGoal, i) => {
                const { operatorId, goal } = opGoal;
                const key = `${
                  focused ? "focused-" : ""
                }${operatorId}-g${goal}`;
                return (
                  <Draggable key={key} draggableId={key} index={i}>
                    {(draggableProvided) => (
                      <OperatorGoalCard
                        {...opGoal}
                        onToggleFocus={handleToggleFocus}
                        onCompleteGoal={handleCompleteGoal}
                        onDeleteGoal={handleDeleteGoal}
                        {...draggableProvided.dragHandleProps}
                        {...draggableProvided.draggableProps}
                        ref={draggableProvided.innerRef}
                      />
                    )}
                  </Draggable>
                );
              })}
            </ol>
            {droppableProvided.placeholder}
          </div>
        )}
      </Droppable>
    </>
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {renderList(focusedGoals, true)}
      {renderList(unfocusedGoals, false)}
    </DragDropContext>
  );
};
export default GoalList;
