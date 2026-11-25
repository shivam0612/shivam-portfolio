import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { loaders } from './pages/loaders';

const Home = lazy(loaders.home);
const About = lazy(loaders.about);
const Experience = lazy(loaders.experience);
const Projects = lazy(loaders.projects);
const ProjectDetail = lazy(loaders.projectDetail);
const Skills = lazy(loaders.skills);
const Contact = lazy(loaders.contact);
const Privacy = lazy(loaders.privacy);
const NotFound = lazy(loaders.notFound);

/** Route table. The router itself (BrowserRouter / MemoryRouter) is provided by main.tsx or tests. */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="experience" element={<Experience />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:slug" element={<ProjectDetail />} />
        <Route path="skills" element={<Skills />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
