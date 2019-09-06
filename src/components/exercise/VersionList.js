import SubmissionService from '../../utils/SubmissionService';
import React, { Component } from 'react';

import './VersionList.css';
import equal from 'fast-deep-equal';
import Util from '../../utils/Util';
import { OverlayTrigger, Popover } from 'react-bootstrap';


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
    faArrowAltCircleLeft,
    faArrowLeft,
    faInfoCircle,
    faPaperPlane,
    faSpinner,
} from '@fortawesome/free-solid-svg-icons';


import PropTypes from 'prop-types';
import Spinner from '../core/Spinner';

library.add(faPaperPlane, faInfoCircle, faArrowLeft, faSpinner, faArrowAltCircleLeft);

class VersionList extends Component {

    state = {
        items: [],
        submissionState: false,
        submissionCount: {
            submissionsRemaining: 0
        }
    };

    onSubmit = () => {
        this.props.submit(true, this.resetSubmitButton);
        this.setState({ submissionState: true });
    };

    resetSubmitButton = () => {
        this.setState({ submissionState: false });
    };

    componentDidMount = async () => {
        const { exercise } = this.props;

        this.fetchSubmissions(exercise.id);
    };

    componentDidUpdate = async (prevProps) => {
        const { exercise, selectedSubmissionId } = this.props;
        if (!equal(exercise, prevProps.exercise) || !equal(selectedSubmissionId, prevProps.selectedSubmissionId)) {
            this.fetchSubmissions(exercise.id);
        }
    };

    fetchSubmissions = async (exerciseId) => {
        const { authorizationHeader } = this.props;
        const {submissions, submissionCount} = await SubmissionService.getSubmissionList(exerciseId, authorizationHeader);
        
        this.setState({ 
            items: submissions, 
            submissionCount: submissionCount
         });
    };

    createPopover(version, result, hints, commitHash) {
        const score = result ? 'Score: ' + result.score : 'No score';
        const hintlist = hints ? hints.map((hint, index) => <small key={index}>{'Hint:' + hint}</small>) : '';
        const alert = commitHash !== this.props.exercise.gitHash && <span><br/>(This Submission is outdated)</span>;

        return (
            <Popover id="popover-basic">
                <Popover.Title>{'Version ' + (version + 1)}</Popover.Title>
                <Popover.Content>
                    {score}
                    {hintlist}
                    {alert}    
                </Popover.Content>
            </Popover>
        );
    }

    createSubmissionItem(item){
        const active = item.id === this.props.selectedSubmissionId;
        const outdated = item.commitHash !== this.props.exercise.gitHash;
        const title = item.graded ? ('Submission ' + (item.version + 1)) : 'Run'; 

        const ret_item = (
                        <li key={item.id} className={ active ? 'active' : ''}>
                            <div id={item.id}
                                 className={'submission-item ' + (outdated ? 'outdated' : '')}>
                                <strong>{title}</strong>
                                <br/>
                                <small>{Util.timeFormatter(item.timestamp)}</small>
                                <br/>
                                <div className="two-box">
                                    <button
                                        className={'style-btn ' + (outdated ? 'warn' : 'submit')}
                                        onClick={this.props.changeSubmissionById.bind(this, item.id)}><FontAwesomeIcon
                                        icon="arrow-alt-circle-left"></FontAwesomeIcon>Load
                                    </button>
                                    <span className="p-1"></span>
                                    <OverlayTrigger trigger="click"
                                                    rootClose={true}
                                                    placement="top"
                                                    overlay={this.createPopover(item.version, item.result, item.hints, item.commitHash)}>
                                        <button className="style-btn ghost"><FontAwesomeIcon icon="info-circle"/>Info
                                        </button>
                                    </OverlayTrigger>
                                </div>
                            </div>
                        </li>
                    );

        return(ret_item);
    }

    

    render() {
        const items = this.state.items || [];
        const isCodeType = this.props.isCodeType;

        let submitButtonContent;
        if (this.state.submissionState)
            submitButtonContent = <Spinner text={'Processing...'} />;
        else
            submitButtonContent = <><FontAwesomeIcon icon="paper-plane"/><span>Submit</span></>;

        let templatePart;
        if (isCodeType) {
            templatePart = (
                <li>
                    <div id={-1} className={'submission-item'}>
                        <strong>Template Version</strong>
                        <br/>
                        <div className="two-box">
                            <button className="style-btn submit"
                                    onClick={this.props.changeSubmissionById.bind(this, -1)}><FontAwesomeIcon
                                icon="arrow-alt-circle-left"/>Load
                            </button>
                        </div>
                    </div>
                </li>
            );
        }

        return (
            <div id={'version-wrapper'}>


                <div>
                    <p><strong>{this.state.submissionCount.submissionsRemaining}</strong>{'/' + this.props.exercise.maxSubmits} Submissions
                        available</p>
                    <button className="style-btn submit full"
                            disabled={this.state.submissionState || this.state.submissionCount.submissionsRemaining <= 0}
                            onClick={this.onSubmit}>{submitButtonContent}</button>
                </div>
                <br/>

                <h4>{isCodeType ? 'Versions' : 'Submission'}</h4>

                <p>{items.length === 0 ? 'No submissions' : ''}</p>

                <ul className="style-list">
                    {items.map(item => this.createSubmissionItem(item),)}
                    {templatePart}
                </ul>
            </div>
        );
    }
}

VersionList.propTypes = {
    exercise: PropTypes.object.isRequired,
    authorizationHeader: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    selectedSubmissionId: PropTypes.string.isRequired,
    changeSubmissionById: PropTypes.func.isRequired,
};

export default VersionList;