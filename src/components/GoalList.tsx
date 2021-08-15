/* eslint-disable react/jsx-props-no-spreading */
import React from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
  ResponderProvided,
} from "react-beautiful-dnd";
import { operatorGoalIngredients } from "../pages/planner";
import {
  completeGoal,
  deleteGoal,
  OperatorGoal,
  OperatorGoalType,
  reorderGoal,
  toggleFavorite,
} from "../store/goalsSlice";
import { useAppDispatch, useAppSelector } from "../store/store";
import { Item, Operator } from "../types";

interface Props {
  operatorMap: Record<string, Operator>;
  itemMap: Record<string, Item>;
}

const GoalList: React.VFC<Props> = ({ operatorMap, itemMap }) => {
  const dispatch = useAppDispatch();
  const goals = useAppSelector((state) => state.goals);

  const handleDelete = (opGoal: OperatorGoal) => {
    dispatch(deleteGoal(opGoal));
  };

  const handleComplete = (opGoal: OperatorGoal) => {
    dispatch(
      completeGoal({
        ...opGoal,
        ingredients: operatorGoalIngredients(opGoal, operatorMap),
      })
    );
  };

  const handleToggleFavorite = (opGoal: OperatorGoal) => {
    dispatch(toggleFavorite(opGoal));
  };

  const handleDragEnd = (result: DropResult, provided: ResponderProvided) => {
    if (result.destination) {
      dispatch(
        reorderGoal({
          oldIndex: result.source.index,
          newIndex: result.destination.index,
        })
      );
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="goallist">
        {(droppableProvided, droppableSnapshot) => (
          <div
            {...droppableProvided.droppableProps}
            ref={droppableProvided.innerRef}
          >
            <ol>
              {goals.operators.map((opGoal, i) => {
                const { operatorId, goal } = opGoal;
                return (
                  <Draggable
                    key={`${operatorId}-g${goal}`}
                    draggableId={`${operatorId}-g${goal}`}
                    index={i}
                  >
                    {(draggableProvided, draggableSnapshot) => (
                      <li
                        {...draggableProvided.draggableProps}
                        {...draggableProvided.dragHandleProps}
                        ref={draggableProvided.innerRef}
                      >
                        {operatorMap[operatorId].name}: {OperatorGoalType[goal]}
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
                          onClick={() => handleToggleFavorite(opGoal)}
                        >
                          {opGoal.favorite ? "Remove" : "Add"} Favorite
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
