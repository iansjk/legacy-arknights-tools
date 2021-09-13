import React, { useContext } from "react";
import ReactDOM from "react-dom";
import { Box, makeStyles } from "@material-ui/core";
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  DraggableRubric,
  Droppable,
  DroppableProvided,
  DropResult,
} from "react-beautiful-dnd";
import { AutoSizer, List, WindowScroller } from "react-virtualized";
import {
  completeGoal,
  deleteGoal,
  OperatorGoalState,
  reorderGoal,
  toggleFocus,
} from "../store/goalsSlice";
import { useAppDispatch, useAppSelector } from "../store/store";
import { operatorGoalIngredients } from "../utils";
import OperatorGoalCard, { ITEM_HEIGHT } from "./OperatorGoalCard";
import PlannerContext from "./PlannerContext";

const useStyles = makeStyles({
  goalList: {
    padding: 0,
    margin: 0,
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

  return (
    <Box component="section" pl={2}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <h3>Focused goals</h3>
        <Droppable droppableId="focused-goal-list">
          {(droppableProvided) => (
            <div
              {...droppableProvided.droppableProps}
              ref={droppableProvided.innerRef}
              className={classes.droppable}
            >
              <ol className={classes.goalList}>
                {focusedGoals.map((opGoal, i) => {
                  const { operatorId, goal, focused } = opGoal;
                  const key = `focused-${operatorId}-g${goal}`;
                  return (
                    <Draggable key={key} draggableId={key} index={i}>
                      {(draggableProvided) => (
                        <OperatorGoalCard
                          operatorId={operatorId}
                          goal={goal}
                          focused={focused}
                          onToggleFocus={handleToggleFocus}
                          onCompleteGoal={handleCompleteGoal}
                          onDeleteGoal={handleDeleteGoal}
                          draggableProvided={draggableProvided}
                          style={{ height: ITEM_HEIGHT }}
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
      </DragDropContext>
      <DragDropContext onDragEnd={handleDragEnd}>
        <h3>Other goals</h3>
        <Droppable
          droppableId="other-goal-list"
          mode="virtual"
          renderClone={(
            draggableProvided: DraggableProvided,
            _,
            rubric: DraggableRubric
          ) => {
            const { operatorId, focused, goal } = unfocusedGoals[
              rubric.source.index
            ];
            return (
              <OperatorGoalCard
                operatorId={operatorId}
                goal={goal}
                focused={focused}
                onToggleFocus={() => {}}
                onCompleteGoal={() => {}}
                onDeleteGoal={() => {}}
                draggableProvided={draggableProvided}
              />
            );
          }}
        >
          {(droppableProvided: DroppableProvided) => (
            <WindowScroller>
              {({ height, isScrolling, onChildScroll, scrollTop }) => (
                <AutoSizer disableHeight>
                  {({ width }) => (
                    <List
                      width={width}
                      autoHeight
                      height={height}
                      isScrolling={isScrolling}
                      onScroll={onChildScroll}
                      scrollTop={scrollTop}
                      rowCount={unfocusedGoals.length}
                      rowHeight={ITEM_HEIGHT}
                      ref={(ref) => {
                        if (ref) {
                          // eslint-disable-next-line react/no-find-dom-node
                          const listRef = ReactDOM.findDOMNode(ref);
                          if (listRef instanceof HTMLElement) {
                            droppableProvided.innerRef(listRef);
                          }
                        }
                      }}
                      rowRenderer={({ index, style }) => {
                        const opGoal = unfocusedGoals[index];
                        const { focused, goal, operatorId } = opGoal;
                        const key = `${operatorId}-g${goal}`;
                        return (
                          <Draggable draggableId={key} key={key} index={index}>
                            {(draggableProvided: DraggableProvided) => (
                              <OperatorGoalCard
                                focused={focused}
                                goal={goal}
                                operatorId={operatorId}
                                onCompleteGoal={handleCompleteGoal}
                                onDeleteGoal={handleDeleteGoal}
                                onToggleFocus={handleToggleFocus}
                                style={style}
                                draggableProvided={draggableProvided}
                              />
                            )}
                          </Draggable>
                        );
                      }}
                    />
                  )}
                </AutoSizer>
              )}
            </WindowScroller>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
};
export default GoalList;
