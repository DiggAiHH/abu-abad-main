import React from 'react';

interface ProjectTrackingProps {
  projects: Array<{ id: string; name: string; status: string }>;
  onProjectClick: (id: string) => void;
}

const ProjectTracking: React.FC<ProjectTrackingProps> = ({ projects, onProjectClick }) => {
  return (
    <div>
      <h1>Project Tracking</h1>
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <span>{project.name} - {project.status}</span>
            <button onClick={() => onProjectClick(project.id)}>View</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectTracking;