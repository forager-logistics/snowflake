import React from 'react'
import TrackSelector from '../components/TrackSelector'
import NightingaleChart from '../components/NightingaleChart'
import KeyboardListener from '../components/KeyboardListener'
import Track from '../components/Track'
import LevelThermometer from '../components/LevelThermometer'
import PointSummaries from '../components/PointSummaries'
import TitleSelector from '../components/TitleSelector'
import Attribution from './Attribution'
import FileImportExport from './FileImportExport'
import { TrackDefinition, MilestoneDefinition } from '../types/tracks';
import { Categories, Tracks, trackDefinitions } from '../types/definitions'
import { emptyTracks, eligibleTitles, trackIds, milestoneToPoints, highestMilestone } from '../types/calculations'
import NameInput from './NameInput'
import Evaluation from '../types/evaluation'

type SnowflakeAppState = {
  milestoneByTrack: Map<Tracks, number>,
  name: string,
  title: string,
  focusedTrackId: Tracks,
}

const emptyState = (): SnowflakeAppState => {
  return {
    name: '',
    title: '',
    milestoneByTrack: emptyTracks,
    focusedTrackId: Tracks.Frontend
  }
}

const defaultState = (): SnowflakeAppState => {
  return emptyState();
}

type Props = {}

class SnowflakeApp extends React.Component<Props, SnowflakeAppState> {
  constructor(props: Props) {
    super(props)
    this.state = emptyState()
  }

  componentDidMount() {
    this.setState(defaultState());
  }

  render() {
    return (
      <main>
        <style jsx global>{`
          body {
            font-family: Helvetica;
          }
          main {
            width: 960px;
            margin: 0 auto;
          }
          .name-input {
            border: none;
            display: block;
            border-bottom: 2px solid #fff;
            font-size: 30px;
            line-height: 40px;
            font-weight: bold;
            width: 380px;
            margin-bottom: 10px;
          }
          .name-input:hover, .name-input:focus {
            border-bottom: 2px solid #ccc;
            outline: 0;
          }
          a {
            color: #888;
            text-decoration: none;
          }
        `}</style>
        <div style={{display: 'flex'}}>
          <div style={{flex: 1}}>
            <form>
              <NameInput
                name={this.state.name}
                setNameFn={this.setName.bind(this)} />
              <TitleSelector
                milestoneByTrack={this.state.milestoneByTrack}
                currentTitle={this.state.title}
                setTitleFn={this.setTitle.bind(this)} />
            </form>
            <PointSummaries milestoneByTrack={this.state.milestoneByTrack} />
            <LevelThermometer milestoneByTrack={this.state.milestoneByTrack} />
          </div>
          <div style={{flex: 0}}>
            <NightingaleChart
                milestoneByTrack={this.state.milestoneByTrack}
                focusedTrack={this.state.focusedTrackId}
                handleTrackMilestoneChangeFn={this.handleTrackMilestoneChange.bind(this)} />
          </div>
        </div>
        <TrackSelector
            milestoneByTrack={this.state.milestoneByTrack}
            focusedTrack={this.state.focusedTrackId}
            setFocusedTrackIdFn={this.setFocusedTrackId.bind(this)} />
        <KeyboardListener
            selectNextTrackFn={this.shiftFocusedTrack.bind(this, 1)}
            selectPrevTrackFn={this.shiftFocusedTrack.bind(this, -1)}
            increaseFocusedMilestoneFn={this.shiftFocusedTrackMilestoneByDelta.bind(this, 1)}
            decreaseFocusedMilestoneFn={this.shiftFocusedTrackMilestoneByDelta.bind(this, -1)} />
        <Track
            milestoneByTrack={this.state.milestoneByTrack}
            track={this.state.focusedTrackId}
            handleTrackMilestoneChangeFn={this.handleTrackMilestoneChange.bind(this)} />
        <FileImportExport 
            name={this.state.name}
            title={this.state.title}
            milestoneByTrack={this.state.milestoneByTrack} 
            loadEvaluationFn={this.loadEvaluation.bind(this)} />
        <Attribution />
      </main>
    )
  }

  handleTrackMilestoneChange(track: Tracks, milestone: number) {
    const milestoneByTrack = this.state.milestoneByTrack
    milestoneByTrack.set(track, milestone)

    const titles = eligibleTitles(milestoneByTrack)
    const title = titles.indexOf(this.state.title) === -1 ? titles[0] : this.state.title

    this.setState({ milestoneByTrack, focusedTrackId: track, title })
  }

  shiftFocusedTrack(delta: number) {
    // let index = trackIds.indexOf(this.state.focusedTrack);
    // index = (index + delta + trackIds.length) % trackIds.length;
    // const focusedTrack = 
    // this.setState({ focusedTrack });
  }

  setFocusedTrackId(track: Tracks) {
    this.setState({ focusedTrackId: track })
  }

  shiftFocusedTrackMilestoneByDelta(delta: number) {
    let prevMilestone = this.state.milestoneByTrack[this.state.focusedTrackId];
    let milestone = prevMilestone + delta;
    if (milestone < 0) milestone = 0;
    if (milestone > highestMilestone) milestone = 5;
    this.handleTrackMilestoneChange(this.state.focusedTrackId, milestone);
  }

  setTitle(title: string) {
    let titles = eligibleTitles(this.state.milestoneByTrack)
    title = titles.indexOf(title) == -1 ? titles[0] : title
    this.setState({ title })
  }

  setName(name: string) {
    this.setState({ name });
  }

  loadEvaluation(evaluation: Evaluation) {
    if (evaluation.name) this.setName(evaluation.name);

    if (evaluation.milestones) {
      const entries = evaluation.milestones.map<[Tracks, number]>(x => [Tracks[x[0]], x[1]]);
      const newMilestonesByTrack = new Map<Tracks, number>(entries);
      this.setState({milestoneByTrack: newMilestonesByTrack});
    }

    if (evaluation.title) this.setTitle(evaluation.title);
  }
}

export default SnowflakeApp