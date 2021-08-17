/* eslint-disable react/jsx-props-no-spreading */
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
  OperatorGoalType,
  reorderGoal,
  toggleFocus,
} from "../store/goalsSlice";
import { useAppDispatch, useAppSelector } from "../store/store";
import { operatorGoalIngredients } from "../utils";
import PlannerContext from "./PlannerContext";

const GoalList: React.VFC = () => {
  const dispatch = useAppDispatch();
  const goals = useAppSelector((state) => state.goals);
  const { operatorMap } = useContext(PlannerContext);

  const handleDelete = (opGoal: OperatorGoalState) => {
    dispatch(deleteGoal(opGoal));
  };

  const handleComplete = (opGoal: OperatorGoalState) => {
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
    if (result.destination) {
      const sourceList = result.source.droppableId.startsWith("focused")
        ? focusedGoals
        : unfocusedGoals;
      const sourceItem = sourceList[result.source.index];
      const destinationList = result.destination.droppableId.startsWith(
        "focused"
      )
        ? focusedGoals
        : unfocusedGoals;
      const destinationItem = destinationList[result.destination.index];
      if (
        result.source.droppableId.startsWith("focused") !==
        result.destination.droppableId.startsWith("focused")
      ) {
        dispatch(toggleFocus(sourceItem));
      }

      let newIndex = 0;
      if (sourceList === destinationList) {
        newIndex = destinationItem.originalIndex;
      } else if (destinationList.length === 0) {
        newIndex =
          destinationList === unfocusedGoals ? goals.operators.length - 1 : 0;
      } else if (result.destination.index === destinationList.length) {
        newIndex =
          destinationList[destinationList.length - 1].originalIndex + 1;
      } else {
        newIndex = Math.max(
          destinationList[result.destination.index].originalIndex - 1,
          0
        );
      }

      dispatch(
        reorderGoal({
          oldIndex: sourceItem.originalIndex,
          newIndex,
        })
      );
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="focused-goal-list">
        {(droppableProvided) => (
          <div
            {...droppableProvided.droppableProps}
            ref={droppableProvided.innerRef}
          >
            <h3>Focused goals</h3>
            <ol>
              {focusedGoals.map((opGoal, i) => {
                const { operatorId, goal } = opGoal;
                return (
                  <Draggable
                    key={`focused-${operatorId}-g${goal}`}
                    draggableId={`focused-${operatorId}-g${goal}`}
                    index={i}
                  >
                    {(draggableProvided) => (
                      <li
                        {...draggableProvided.dragHandleProps}
                        {...draggableProvided.draggableProps}
                        ref={draggableProvided.innerRef}
                      >
                        {operatorMap[operatorId].name}: {OperatorGoalType[goal]}{" "}
                        (internal index: {opGoal.originalIndex})
                        <br />
                        <button
                          type="button"
                          onClick={() => handleDelete(opGoal)}
                        >
                          Delete
                        </button>
                        <br />
                        <button
                          type="button"
                          onClick={() => handleComplete(opGoal)}
                        >
                          Complete
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleFocus(opGoal)}
                        >
                          {opGoal.focused ? "Remove" : "Add"} Focus
                        </button>
                      </li>
                    )}
                  </Draggable>
                );
              })}
            </ol>
            {droppableProvided.placeholder}
          </div>
        )}
      </Droppable>
      <Droppable droppableId="unfocused-goal-list">
        {(droppableProvided) => (
          <div
            {...droppableProvided.droppableProps}
            ref={droppableProvided.innerRef}
          >
            <h3>Other goals</h3>
            <ol>
              {unfocusedGoals.map((opGoal, i) => {
                const { operatorId, goal } = opGoal;
                return (
                  <Draggable
                    key={`${operatorId}-g${goal}`}
                    draggableId={`${operatorId}-g${goal}`}
                    index={i}
                  >
                    {(draggableProvided) => (
                      <li
                        {...draggableProvided.draggableProps}
                        {...draggableProvided.dragHandleProps}
                        ref={draggableProvided.innerRef}
                      >
                        {operatorMap[operatorId].name}: {OperatorGoalType[goal]}{" "}
                        (internal index: {opGoal.originalIndex})
                        <br />
                        <button
                          type="button"
                          onClick={() => handleDelete(opGoal)}
                        >
                          Delete
                        </button>
                        <br />
                        <button
                          type="button"
                          onClick={() => handleComplete(opGoal)}
                        >
                          Complete
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleFocus(opGoal)}
                        >
                          {opGoal.focused ? "Remove" : "Add"} Focus
                        </button>
                      </li>
                    )}
                  </Draggable>
                );
              })}
            </ol>
            {droppableProvided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
export default GoalList;
