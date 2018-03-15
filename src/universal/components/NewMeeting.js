// @flow
import React from 'react';
import {DragDropContext as dragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import withHotkey from 'react-hotkey-hoc';
import {createFragmentContainer} from 'react-relay';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import withMutationProps from 'universal/utils/relay/withMutationProps';
import {Route, Switch, withRouter} from 'react-router-dom';
import styled from 'react-emotion';
import {Helmet} from 'react-helmet';
import MeetingAvatarGroup from 'universal/modules/meeting/components/MeetingAvatarGroup/MeetingAvatarGroup';
import NewMeetingLobby from 'universal/components/NewMeetingLobby';
import NewMeetingPhaseHeading from 'universal/components/NewMeetingPhaseHeading/NewMeetingPhaseHeading';
import NewMeetingSidebar from 'universal/components/NewMeetingSidebar';

import type {MeetingTypeEnum, NewMeetingPhaseTypeEnum} from 'universal/types/schema.flow';
import type {NewMeeting_viewer as Viewer} from './__generated__/NewMeeting_viewer.graphql';
import {meetingTypeToLabel, meetingTypeToSlug} from 'universal/utils/meetings/lookups';
import ui from 'universal/styles/ui';

const MeetingContainer = styled('div')({
  backgroundColor: ui.backgroundColor,
  display: 'flex',
  height: '100vh'
});

const MeetingArea = styled('div')({
  display: 'flex !important',
  flex: 1,
  flexDirection: 'column',
  minWidth: '60rem',
  width: '100%'
});

const MeetingAreaHeader = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  maxWidth: '100%',
  overflow: 'hidden',
  padding: '1rem',
  width: '100%'
});

type Props = {
  atmosphere: Object,
  localPhase: NewMeetingPhaseTypeEnum,
  meetingType: MeetingTypeEnum,
  viewer: Viewer
}
const NewMeeting = (props: Props) => {
  const {localPhase, meetingType, viewer} = props;
  const {team} = viewer;
  const {teamName} = team;
  const meetingLabel = meetingTypeToLabel[meetingType];
  return (
    <MeetingContainer>
      <Helmet title={`${meetingLabel} Meeting for ${teamName} | Parabol`} />
      <NewMeetingSidebar localPhase={localPhase} viewer={viewer} />
      <MeetingArea>
        <MeetingAreaHeader>
          <NewMeetingPhaseHeading />
          <MeetingAvatarGroup
            gotoItem={() => {}}
            isFacilitating={false}
            localPhase={localPhase}
            localPhaseItem={null}
            team={team}
          />
        </MeetingAreaHeader>
        <Switch>
          <Route
            path={`/${meetingTypeToSlug[meetingType]}/:teamId`}
            render={() => <NewMeetingLobby meetingType={meetingType} team={team} />}
          />
        </Switch>
      </MeetingArea>
    </MeetingContainer>
  );
};

export default createFragmentContainer(
  dragDropContext(HTML5Backend)(
    withHotkey(
      withAtmosphere(
        withMutationProps(
          withRouter(
            NewMeeting
          )
        )
      )
    )
  ),
  graphql`
    fragment NewMeeting_viewer on User {
      ...NewMeetingSidebar_viewer
      team(teamId: $teamId) {
        ...MeetingAvatarGroup_team
        ...NewMeetingLobby_team
        checkInGreeting {
          content
          language
        }
        checkInQuestion
        teamId: id
        teamName: name
        meetingId
        tier
        teamMembers(sortBy: "checkInOrder") {
          id
          preferredName
          picture
          checkInOrder
          isCheckedIn
          isConnected
          isFacilitator
          isLead
          isSelf
          userId
        }
        newMeeting {
          id
          facilitatorUserId
          phases {
            phaseType
            stages {
              isComplete
            }
          }
          ... on RetrospectiveMeeting {
            thoughts {
              id
            }
            thoughtGroups {
              id
            }
          }
        }
      }
    }
  `
);
