---
layout: page
title: Lectures
permalink: /lectures/
nav_order: 2
---

# Calendar

{% for module in site.modules %}
{{ module }}
{% endfor %}


# Old Lectures
A complete list of the old semester lectures can be found below.
<select id="lectureDropdown">
    <option value="#lecture-1">1 - Introduction to Rigid Body Motion</option>
    <option value="#lecture-2">2 - Planar Coordinates and Rotations</option>
    <option value="#lecture-3">3 - Planar Transformations</option>
    <option value="#lecture-4">4 - Lie Group and Homogeneous Coordinates</option>
    <option value="#lecture-5">5 - Introduction to Velocity</option>
    <option value="#lecture-6">6 - Angular Velocity and Twists</option>
    <option value="#lecture-7">7 - Vectors - Velocity Overview</option>
    <option value="#lecture-8">8 - Exponential Representation of Rotations</option>
    <option value="#lecture-9">9 - Exponential Representation of Motion</option>
    <option value="#lecture-10">10 - Midterm Review</option>
    <option value="#lecture-11">11 - Introduction to Manipulators and Manipulator Kinematics</option>
    <option value="#lecture-12">12 - Forward Kinematics</option>
    <option value="#lecture-13">13 - Inverse Kinematics 1</option>
    <option value="#lecture-14">14 - Inverse Kinematics 2</option>
    <option value="#lecture-15">15 - Manipulator Jacobian 1</option>
    <option value="#lecture-16">16 - Manipulator Jacobian 2</option>
    <option value="#lecture-17">17 - Jacobians and Singularity Analysis</option>
    <option value="#lecture-18">18 - Trajectory Design 1</option>
    <option value="#lecture-19">19 - Trajectory Design 2</option>
    <option value="#lecture-20">20 - Trajectory Design 3</option>
    <option value="#lecture-21">21 - Trajectory Design 4</option>
    <option value="#lecture-22">22 - Wrenches and Forces</option>
    <option value="#lecture-23">23 - Introduction to Control</option>
    <option value="#lecture-24">24 - Control for Locomotion</option>
    <option value="#lecture-25">25 - Final Review</option>
</select>

<style>
    .pdf-viewer-container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .pdf-viewer {
        width: 100%;
        max-width: 800px;
        height: 600px;
        border: none;
    }
    .navigation-buttons {
        margin-top: 10px;
    }
    .navigation-buttons button {
        margin: 0 5px;
    }
</style>

<div class="pdf-viewer-container">
    <iframe class="pdf-viewer" id="pdfViewer"></iframe>
    <div class="navigation-buttons">
        <button id="prevLecture">Previous</button>
        <button id="nextLecture">Next</button>
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', () => {
        const viewer = document.getElementById('pdfViewer');
        const lectures = [
            'lecture1.pdf',
            'lecture2.pdf',
            'lecture3.pdf',
            'lecture4.pdf',
            'lecture5.pdf',
            'lecture6.pdf',
            'lecture7.pdf',
            'lecture8.pdf',
            'lecture9.pdf',
            'lecture10.pdf',
            'lecture11.pdf',
            'lecture12.pdf',
            'lecture13.pdf',
            'lecture14.pdf',
            'lecture15.pdf',
            'lecture16.pdf',
            'lecture17.pdf',
            'lecture18.pdf',
            'lecture19.pdf',
            'lecture20.pdf',
            'lecture21.pdf',
            'lecture22.pdf',
            'lecture23.pdf',
            'lecture24.pdf',
            'lecture25.pdf'
        ];
        let currentLecture = 0;

        const loadLecture = (index) => {
            viewer.src = `{{ site.baseurl }}/pdfs-Fa2024/${lectures[index]}`;
        };

        document.getElementById('prevLecture').addEventListener('click', () => {
            if (currentLecture > 0) {
                currentLecture--;
                loadLecture(currentLecture);
            }
        });

        document.getElementById('nextLecture').addEventListener('click', () => {
            if (currentLecture < lectures.length - 1) {
                currentLecture++;
                loadLecture(currentLecture);
            }
        });

        document.getElementById('lectureDropdown').addEventListener('change', function() {
            const selectedLecture = this.value.split('#lecture-')[1];
            currentLecture = parseInt(selectedLecture) - 1;
            loadLecture(currentLecture);
        });

        loadLecture(currentLecture);
    });
</script>