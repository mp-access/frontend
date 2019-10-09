import React, { Component } from 'react';
import CourseDataService from '../utils/CourseDataService';
import AssignmentList from '../components/AssignmentList';
import Util from '../utils/Util';
import AdminService from '../utils/AdminService';
import { ExportModal } from '../components/course/AssistantExport';
import ResultService from "../utils/ResultService";
import { Calendar } from 'react-feather';
import { withBreadCrumbsAndAuth } from '../components/BreadCrumbProvider';

class Course extends Component {

    constructor(props) {
        super(props);
        this.state = {
            course: undefined,
            courseResults: undefined,
            showModal: false,
            modalAssignmentTitle: '',
            assignmentExport: undefined,
        };
    }

    componentDidMount() {
        const courseId = this.props.match.params.courseId;
        const { context } = this.props;

        CourseDataService.getCourses(context.authorizationHeader)
            .then(result => {
                const course = result.find(c => c.id === courseId);
                this.setState({ course:  course});
                this.props.crumbs.setBreadCrumbs(course.breadCrumbs);
            })
            .catch(err => {
                console.debug('Error:', err.toString());
            });

         ResultService.getCourseResults(courseId, context.authorizationHeader)
            .then(result => this.setState({courseResults: result}))
           //  .then(result => console.warn(result))
            .catch(err => {
                console.debug('Error:', err.toString());
            });
    }

    componentWillUnmount() {
        this.props.crumbs.setBreadCrumbs([]);
    }

    onAssignmentExportClick = (assignment) => {
        this.setState({
            showModal: true,
            modalAssignmentTitle: assignment.label,
        });

        const assignmentId = assignment.id;
        const courseId = this.state.course.id;
        const { context } = this.props;

        AdminService.exportAssignmentResults(courseId, assignmentId, context.authorizationHeader)
            .then(result => this.setState({ assignmentExport: result }))
            .catch(err => console.error(err));
    };

    closeModal = () => this.setState({ showModal: false });

    render() {
        const { course, assignmentExport, modalAssignmentTitle, showModal, courseResults } = this.state;
        if (!course || !courseResults) {
            return null;
        }

        const isCourseAdmin = this.props.context.isCourseAdmin(course.id);

        return (
            <div className="container">
                <div className="panel">
                    <div className="heading">
                        <h2>{course.title}</h2>
                        <small><Calendar size={12} /> Open from: <strong>{Util.timeFormatter(course.startDate)}</strong> -
                            to: <strong>{Util.timeFormatter(course.endDate)}</strong></small>
                    </div>
                    <p>{course.description}</p>
                    <br/>
                    <br/>
                    <div>
                        <AssignmentList courseId={course.id} assignments={course.assignments}
                                        isAdmin={isCourseAdmin}
                                        onAssignmentExportClick={this.onAssignmentExportClick}
                                        results={courseResults}
                        />
                    </div>

                    {assignmentExport && <ExportModal assignmentTitle={modalAssignmentTitle}
                                                    assignmentExport={assignmentExport}
                                                    showModal={showModal && !!assignmentExport}
                                                    handleClose={this.closeModal}/>
                    }
                </div>
            </div>
        );
    }
}

export default withBreadCrumbsAndAuth(Course);