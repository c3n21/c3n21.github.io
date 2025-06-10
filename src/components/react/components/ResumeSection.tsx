
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase } from 'lucide-react';

const ResumeSection = () => {
  const experiences = [
    {
      title: "Senior Full Stack Developer",
      company: "Tech Company Inc.",
      period: "2022 - Present",
      description: "Lead development of scalable web applications using React, Node.js, and cloud technologies. Managed a team of 4 developers and improved system performance by 40%."
    },
    {
      title: "Full Stack Developer",
      company: "Digital Solutions Ltd.",
      period: "2020 - 2022",
      description: "Developed and maintained multiple client projects using modern web technologies. Collaborated with designers and product managers to deliver high-quality solutions."
    },
    {
      title: "Frontend Developer",
      company: "Startup Innovations",
      period: "2019 - 2020",
      description: "Built responsive user interfaces and improved user experience. Worked with React, Vue.js, and modern CSS frameworks to create engaging web applications."
    }
  ];

  const skills = [
    "JavaScript", "TypeScript", "React", "Node.js", "Python", "AWS", 
    "MongoDB", "PostgreSQL", "Docker", "Git", "HTML/CSS", "Tailwind CSS"
  ];

  const education = [
    {
      degree: "Bachelor of Science in Computer Science",
      school: "University of Technology",
      period: "2015 - 2019",
      description: "Graduated Magna Cum Laude. Focused on software engineering, algorithms, and web development."
    }
  ];

  return (
    <section id="resume" className="py-20 bg-muted/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Resume
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            My professional journey and technical expertise
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Experience */}
          <div className="lg:col-span-2 space-y-6 animate-fade-in">
            <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Briefcase className="text-primary" size={24} />
              Experience
            </h3>
            
            {experiences.map((exp, index) => (
              <Card key={index} className="hover-scale transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">{exp.title}</CardTitle>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <p className="text-primary font-semibold">{exp.company}</p>
                    <Badge variant="secondary">{exp.period}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{exp.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Skills & Education */}
          <div className="space-y-8 animate-fade-in">
            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Technical Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="hover-scale">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
              </CardHeader>
              <CardContent>
                {education.map((edu, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="font-semibold">{edu.degree}</h4>
                    <p className="text-primary font-medium">{edu.school}</p>
                    <Badge variant="secondary" className="text-xs">{edu.period}</Badge>
                    <p className="text-sm text-muted-foreground mt-2">{edu.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Download Resume */}
            <div className="text-center">
              <Button className="w-full hover-scale">
                Download Full Resume
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResumeSection;
